import { Request, Response, NextFunction } from 'express';
import { Users } from '../models/user';
import { parseAuthToken } from './parse-auth-token';

export const AUTH_TOKEN_COOKIE = 'auth-token';
export const AUTHORIZATION_HEADER = 'authorization';

export async function parseUser(req: Request, res: Response, next: NextFunction) {
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
