import { config } from './config';
import { initializeDatabase } from './orm';
import { initializeRoutesAndListen } from './router';

(async () => {
    console.log(`Starting server...`);
    
    let port = config.try('server.port', 8081);
    
    try {
        console.log(`Initializing the database...`);
        await initializeDatabase();
        
        console.log(`Mapping routes and starting express server...`);
        await initializeRoutesAndListen(port);
    }
    catch (e) {
        console.error(e);
        console.error(`Failed to start server. Failing fast.`);
        return void(process.exit(-1));
    }
    
    console.log(`Server started successfully. Listening on port ${port}`);
})();
