import * as express from 'express';
import { Server } from 'http';
import { config } from './config';
import { passport } from './util/passport';
import { wrapPromise } from './util/wrap-promise';
import cookieParser = require('cookie-parser');
import { User, createAuthToken } from './models/user';

export function initializeRoutesAndListen(port: number): Promise<Server> {
    return new Promise((resolve, reject) => {
        let secure = config.try('server.secure', false);
        
        let app = express();
        
        app.use(cookieParser(), passport.initialize(), passport.session());
        
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
        
        const server = app.listen(port, (err: any, result: any) => {
            if (err) return void(reject(err));
            resolve(server);
        });
    });
}
