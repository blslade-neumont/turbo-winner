import * as express from 'express';
import { config } from "./config";

export function initializeRoutesAndListen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        let secure = config.try('server.secure', false);
        
        let app = express();
        
        app.get('/', (req, res) => {
            res.status(200).send(`You've reached the api server!`);
        });
        
        app.listen(port, (err: any, result: any) => {
            if (err) return void(reject(err));
            resolve(result);
        });
    });
}
