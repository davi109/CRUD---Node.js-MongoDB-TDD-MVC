const connectBD = require('../connection/bd');

const DB_NAME = 'Cookmaster';

class UserModel {
    constructor(name, email, password, role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    validateEmail() {
        const re = /\S+@\S+\.\S+/;
        return re.test(this.email);
    }

    validateBody() {
        const array = Object.keys(this).map((item) => this[item] === undefined)
        .filter((item) => item === true);
        if (array.length > 0) {
            return false;
        }
        return true;
    }

    static validateAdmin(request) {
        if (request.user.role === 'admin') {
            return true;
        }
        return false;
    }

    async duplicateEmail() {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);
        const result = await db.collection('users').find({ email: this.email }).toArray();
        connection.close();
    
        if (result.length > 0) {
            return true;
        }

        return false;
    }

    async saveUser() {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);

        const res = await db.collection('users').insertOne(this);
        delete res.ops[0].password;
        
        await connection.close();
        return res.ops[0];
    }

    static async doLogin(email, password) {
        const connection = await connectBD();
        const db = connection.db(DB_NAME);

        const authUser = await db.collection('users').find({ email, password }).toArray();
        await connection.close();

        return authUser;
    }
}

module.exports = UserModel;
