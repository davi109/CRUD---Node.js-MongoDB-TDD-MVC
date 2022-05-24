const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

module.exports = {

    async create(request, response) {
        const { name, email, password } = request.body;
        const user = new UserModel(name, email, password, 'user');

        if (!user.validateBody() || !user.validateEmail()) {
            return response.status(400).json({ message: 'Invalid entries. Try again.' });
        }
        const test = await user.duplicateEmail();

        if (test) {
            return response.status(409).json({ message: 'Email already registered' });
        }

        const res = await user.saveUser();
        
        return response.status(201).json({ user: res });
    },

    async createAdmin(request, response) {
        const { name, email, password } = request.body;
        const user = new UserModel(name, email, password, 'admin');

        if (!user.validateBody() || !user.validateEmail()) {
            return response.status(400).json({ message: 'Invalid entries. Try again.' });
        }
        const test = await user.duplicateEmail();

        if (test) {
            return response.status(409).json({ message: 'Email already registered' });
        }

        if (!UserModel.validateAdmin(request)) {
            return response.status(403).json({ message: 'Only admins can register new admins' });
        }

        const res = await user.saveUser();
        
        return response.status(201).json({ user: res });
    },

    async login(request, response) {
        const { email, password } = request.body;

        if (email === undefined || password === undefined) {
            return response.status(401).json({ message: 'All fields must be filled' });
        }

        const authUser = await UserModel.doLogin(email, password);

        if (authUser.length < 1) {
            return response.status(401).json({ message: 'Incorrect username or password' });
        }

        const { _id: userId } = authUser[0];
        const payload = { _id: userId, email: authUser[0].email, role: authUser[0].role };
        const token = jwt.sign(payload, 'KEY_DO_JWT', { expiresIn: '12h' });

        return response.status(200).json({ token });
    },
};