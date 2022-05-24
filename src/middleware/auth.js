const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const RecipeModel = require('../models/RecipeModel');

const NOT_FOUND = 'recipe not found';

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

        const result = await RecipeModel.listRecipes(id, res);

        if (result.length < 1) return res.status(404).json({ message: NOT_FOUND });

        const { _id: userId } = req.user;

        if (req.user.role === 'admin' || result.userId === userId) {
            next();
        } else {
            return res.status(401).json({ message: 'missing auth token' });
        }
    },
};