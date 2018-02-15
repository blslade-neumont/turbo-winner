

module.exports = {
    env: {
        NODE_ENV: process.env.NODE_ENV || "development"
    },
    
    websocketUrl: 'https://turbo-winner.herokuapp.com',
    
    debugLog: {
        playerCreate: false,
        playerUpdate: false
    }
}
