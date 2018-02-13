import * as express from 'express';
import { config } from './config';

(() => {
    console.log(`Starting server...`);
    
    let secure = config.try('server.secure', false);
    let port = config.try('server.port', 8081);
    
    let app = express();
    
    app.get('/', (req, res) => {
        res.status(200).send(`You've reached the api server!`);
    });
    
    app.listen(port, () => {
        console.log(`Server started successfully. Listening on port ${port}`);
    });
})();
