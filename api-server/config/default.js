

module.exports = {
    server: {
        port: process.env.PORT || 80
    },
    
    db: {
        connectionString: process.env.API_MONGO_CONNECTION_STRING,
        databaseName: process.env.API_MONGO_DATABASE_NAME || 'turbo-winner'
    },
    
    frontendRoot: 'http://localhost:8080',
    
    oauth: {
        google: {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL
        }
    },
    
    jwt: {
        secret: process.env.JWT_SECRET
    }
};
