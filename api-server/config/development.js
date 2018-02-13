

module.exports = {
    server: {
        port: 8081
    },
    
    db: {
        connectionString: process.env.API_MONGO_CONNECTION_STRING,
        databaseName: process.env.API_MONGO_DATABASE_NAME || 'turbo-winner'
    }
};
