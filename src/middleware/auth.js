const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_DB_URL = `mongodb://${process.env.HOST || 'mongodb'}:27017/Cookmaster`;
const DB_NAME = 'Cookmaster';
const NOT_FOUND = 'recipe not found';

async function connectBD(response) {
    try {
        const connection = await MongoClient.connect(MONGO_DB_URL,
             { 
                 useNewUrlParser: true, 
                 useUnifiedTopology: true, 
            });
        return connection;
    } catch (error) {
        return response.status(500).json({ message: 'Server error' }); 
    }  
}

module.exports = {
    async verifyJWT(req, res, next) {
        /*
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'missing auth token' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ message: 'jwt malformed' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) { 
            return res.status(401).json({ message: 'jwt malformed' });
        } 
        */
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'missing auth token' });
        }
        
        jwt.verify(token, 'KEY_DO_JWT', (error, decoded) => {
            const message = { message: 'jwt malformed' };
            if (error) return res.status(401).json(message);
            req.user = decoded;
            return next();
        });
    },

    async verifyRecipeOwner(req, res, next) {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(404).json({ message: NOT_FOUND });

        const connection = await connectBD(res);
        const db = connection.db(DB_NAME);
        
        const result = await db.collection('recipes').find({ _id: new ObjectId(id) }).toArray();
        await connection.close();

        if (result.length < 1) return res.status(404).json({ message: NOT_FOUND });

        const { _id: userId } = req.user;

        if (req.user.role === 'admin' || result[0].userId === userId) {
            next();
        } else {
            return res.status(401).json({ message: 'missing auth token' });
        }
    },
};