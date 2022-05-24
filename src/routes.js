const express = require('express');

const routes = express.Router();

const upload = require('./middleware/uploadImage');
const auth = require('./middleware/auth');

const UserController = require('./controllers/UserController');
const RecipesController = require('./controllers/RecipeController');

routes.post('/users', UserController.create);
routes.post('/users/admin', auth.verifyJWT, UserController.createAdmin);
routes.post('/login', UserController.login);
routes.post('/recipes', auth.verifyJWT, RecipesController.create);
routes.get('/recipes', RecipesController.index);
routes.get('/recipes/:id', RecipesController.index);
routes.put('/recipes/:id', auth.verifyJWT, auth.verifyRecipeOwner, RecipesController.update);
routes.delete('/recipes/:id', auth.verifyJWT, auth.verifyRecipeOwner, RecipesController.delete);

routes.put(
    '/recipes/:id/image', 
    auth.verifyJWT,
    auth.verifyRecipeOwner,
    upload.single('image'), 
    RecipesController.insertImage,
);

module.exports = routes;