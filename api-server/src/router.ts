import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { config } from './config';
import { User, createAuthToken, Users } from './models/user';
import { passport } from './util/passport';
import { wrapPromise } from './util/wrap-promise';
import { decodeJwt } from './util/decode-jwt';
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser')

export const AUTH_TOKEN_COOKIE = 'auth-token';
export const AUTHORIZATION_HEADER = 'authorization';

function allowAllOrigins(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    if (req.header("Access-Control-Request-Headers")) res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    next();
}

function parseAuthToken(authToken: string): User | null {
    let json = decodeJwt(authToken);
    if (!json) return null;
    return json;
}

async function parseUser(req: Request, res: Response, next: NextFunction) {
    try {
        (<any>req).jwt = null;
        let authToken = req.cookies[AUTH_TOKEN_COOKIE];
        if (!authToken && req.headers[AUTHORIZATION_HEADER] && typeof req.headers[AUTHORIZATION_HEADER] === 'string') {
            var authorizationHeader = (<string>req.headers[AUTHORIZATION_HEADER]).split(' ');
            if (authorizationHeader.length == 2 && authorizationHeader[0] === 'Bearer') authToken = authorizationHeader[1];
        }
        if (typeof authToken === 'string' && authToken) {
            let user = parseAuthToken(authToken);
            if (!user) return;
            user = await Users.findOne({ googleId: user.googleId });
            (<any>req).jwt = user;
        }
    }
    catch { }
    finally {
        next();
    }
}

export function initializeRoutesAndListen(port: number): Promise<Server> {
    return new Promise((resolve, reject) => {
        let secure = config.try('server.secure', false);
        
        let app = express();
        
        app.use(
            cookieParser(),
            bodyParser.urlencoded({ extended: true }),
            bodyParser.json(),
            passport.initialize(),
            passport.session(),
            allowAllOrigins
        );
        
        app.get('/', (req, res) => {
            res.status(200).send(`You've reached the api server!`);
        });
        
        app.get('/oauth/google', (req, res) => {
            let handler = passport.authenticate('google', <any>{ scope: 'profile', prompt: 'select_account' });
            handler(req, res, () => {});
        });
        
        app.get('/oauth/google/callback', async (req, res) => {
            let handler = passport.authenticate('google');
            await wrapPromise(handler, req, res);
            
            let user: User = <any>req.user;
            let token = createAuthToken(user);
            let frontendRoot = config.try<string>('frontendRoot');
            if (!frontendRoot) throw new Error(`No frontend root URL`);
            res.redirect(`${frontendRoot}/assets/set-token.html?token=${encodeURIComponent(token)}`);
        });
        
        app.get('/current-profile', parseUser, (req: Request, res: Response) => {
            res.status(200).send((<any>req).jwt);
        });
        
        app.post('/update-profile', parseUser, async (req: Request, res: Response) => {
            let user: User | null = (<any>req).jwt;
            if (!user) return void(res.status(401).send(`You are not logged in!`));
            try {
                await Users.update({ googleId: user.googleId }, { $set: req.body });
                user = await Users.findOne({ googleId: user.googleId });
            }
            catch (e) {
                console.error(e);
                return void(res.status(500).send(`Something wicked this way comes.`));
            }
            res.status(200).send(user);
        });
        
        app.get('/highscores', async (req: Request, res: Response) => {
            let topUsers = await Users.find().sort('score', -1).limit(10).toArray();
            let topScores = topUsers.map(user => ({ nickname: user.nickname, color: user.color, score: user.score }));
            res.status(200).json(topScores);
        });
        
        const server = app.listen(port, (err: any, result: any) => {
            if (err) return void(reject(err));
            resolve(server);
        });
    });
}
