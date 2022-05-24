const { ObjectId } = require('mongodb');
const connectBD = require('../connection/bd');

const DB_NAME = 'Cookmaster';

class RecipeModel {
    constructor(name, ingredients, preparation) {
        this.name = name;
        this.ingredients = ingredients;
        this.preparation = preparation;
    }

    static validateBody(obj) {
        const array = Object.keys(obj).map((item) => obj[item] === undefined)
        .filter((item) => item === true);
        if (array.length > 0) {
            return false;
        }
        return true;
    }

    async saveRecipe(userId) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);
        this.userId = userId;
        
        const res = await db.collection('recipes').insertOne(this);
        await connection.close();
        return res.ops[0];
    }

    static async listRecipes(id, response) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);
        let res;

        if (id === undefined) {
            res = await db.collection('recipes').find().toArray();  
        } else if (!ObjectId.isValid(id)) {
            return response.status(404).json({ message: 'recipe not found' });
        } else {
            [res] = await db.collection('recipes').find({ _id: new ObjectId(id) }).toArray();
            if (res === undefined) {
                await connection.close();
                return response.status(404).json({ message: 'recipe not found' });
            }
        }
        await connection.close();
        return res;
    }

    async updateRecipe(id) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);

        const values = { $set:
             { name: this.name, ingredients: this.ingredients, preparation: this.preparation },
            };

        await db.collection('recipes').updateOne({ _id: new ObjectId(id) }, values);
        const res = await db.collection('recipes').find({ _id: new ObjectId(id) }).toArray();
        await connection.close();
        console.log(res[0]);
        return res[0];
    }

    static async uploadImage(id, url) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);

        const values = { $set: { image: url } };
        await db.collection('recipes').updateOne({ _id: new ObjectId(id) }, values);
        const res = await db.collection('recipes').find({ _id: new ObjectId(id) }).toArray();
        await connection.close();
        return res[0];
    }

    static async deleteRecipe(id) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);

        await db.collection('recipes').deleteOne({ _id: new ObjectId(id) });
        await connection.close();
    }
}

module.exports = RecipeModel;
