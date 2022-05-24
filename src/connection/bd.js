require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_DB_URL = `mongodb://${process.env.HOST || 'mongodb'}:27017/Cookmaster`;

module.exports = async function connectBD() {
    try {
        const connection = await MongoClient.connect(MONGO_DB_URL,
             { 
                 useNewUrlParser: true, 
                 useUnifiedTopology: true, 
            });
        return connection;
    } catch (error) {
        return error;
    }  
};