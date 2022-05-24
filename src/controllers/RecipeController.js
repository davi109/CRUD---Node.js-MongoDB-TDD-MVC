const RecipeModel = require('../models/RecipeModel');

module.exports = {

    async create(request, response) {
        const { name, ingredients, preparation } = request.body;

        if (!RecipeModel.validateBody({ name, ingredients, preparation })) {
            return response.status(400).json({ message: 'Invalid entries. Try again.' });
        }

        const { _id: userId } = request.user;
        const recipe = new RecipeModel(name, ingredients, preparation);
        const res = await recipe.saveRecipe(userId);

        return response.status(201).json({ recipe: res });
    },

    async index(request, response) {
        const { id } = request.params;
        const res = await RecipeModel.listRecipes(id, response);
        return response.status(200).json(res);
    },

    async update(request, response) {
        const { id } = request.params;
        const { name, ingredients, preparation } = request.body;

        if (!RecipeModel.validateBody({ name, ingredients, preparation })) {
            return response.status(400).json({ message: 'Invalid entries. Try again.' });
        }

        const recipe = new RecipeModel(name, ingredients, preparation);
        const res = await recipe.updateRecipe(id);
        
        return response.status(200).json(res);
    },

    async delete(request, response) {
        const { id } = request.params;

        await RecipeModel.deleteRecipe(id);

        return response.status(204).json({});
    },

    async insertImage(request, response) {
        const { id } = request.params;
        const url = `localhost:3000/src/uploads/${id}.jpeg`;

        if (!request.file) {
            return response.status(400)
            .json({ message: 'Invalid entries. Try again' });
        } 

        const res = await RecipeModel.uploadImage(id, url);
   
        return response.status(200).json(res);
    },
};