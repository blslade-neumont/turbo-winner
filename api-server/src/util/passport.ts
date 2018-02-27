import * as passport from 'passport';
import { Users, User } from '../models/user';
import { config } from '../config';
import { wrapCallback } from './wrap-callback';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.serializeUser(wrapCallback(async function(user: User) {
    return user._id;
}));
passport.deserializeUser(wrapCallback(async function(id: number) {
    return await Users.findOne({ id: id });
}));

let googleConfig = config.try('oauth.google', { enabled: false });
if (typeof googleConfig.enabled === 'undefined' || googleConfig.enabled) {
    passport.use(new GoogleStrategy(googleConfig, wrapCallback(async function(accessToken, refreshToken, profile) {
        //Sample profile: https://pastebin.com/d2sfU60J
        let result = await Users.update({
            googleId: profile.id
        }, {
            $set: {
                displayName: profile.displayName,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }, {
            upsert: true
        });
        let user = await Users.findOne({ googleId: profile.id });
        return user;
    })));
}

export { passport };
