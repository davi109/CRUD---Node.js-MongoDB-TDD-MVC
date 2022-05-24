
const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoDbUrl = `mongodb://${process.env.HOST || 'mongodb'}:27017/Cookmaster`;

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const res = require('express/lib/response');

chai.should();
chai.use(chaiHttp);

describe('Testes relacionados ao usuario normal', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
    const users = {
      name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' };
    await db.collection('users').insertOne(users);
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir cadastrar um usuário', (done) => {
    const user = {
      name: 'Davi',
      email: 'davi@teste.com',
      password: '123456'
    }
    chai.request(app)
    .post('/users/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.have.property('user')
      res.body.user.should.have.property('name');
      res.body.user.should.have.property('email');
      res.body.user.should.have.property('role');
      res.body.user.should.not.have.property('password');
      done();
    });
  });

  it('Não deve permitir cadastrar um usuário sem o campo email', (done) => {
    const user = {
      name: 'Davi',
      password: '123456'
    }
    chai.request(app)
    .post('/users/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eq('Invalid entries. Try again.');
      done();
    });
  });

  it('Não deve permitir cadastrar um usuário sem o campo password', (done) => {
    const user = {
      name: 'Davi',
      email: 'davi@gmail.com'
    }
    chai.request(app)
    .post('/users/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eq('Invalid entries. Try again.');
      done();
    });
  });

  it('Não deve permitir cadastrar com um email inválido', (done) => {
    const user = {
      name: 'Davi',
      email: "davi@teste",
      password: '123456'
    }
    chai.request(app)
    .post('/users/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eq('Invalid entries. Try again.');
      done();
    });
  });

  it('Não deve permitir cadastrar um usuário com email já cadastrado', (done) => {
    const user = {
      name: 'Davi',
      email: 'teste@teste.com',
      password: '123456'
    }
    chai.request(app)
    .post('/users/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(409);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eq('Email already registered');
      done();
    });
  });

  it('Deve permitir realizar o login do usuario', (done) => {
    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }
    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token').not.equal(null);
      done();
    });
  });

  it('Não deve permitir realizar o login do usuario com senha incorreta', (done) => {
    const user = {
      email: 'teste@teste.com',
      password: 'test'
    }
    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('Incorrect username or password');
      done();
    });
  });

  it('Não deve permitir realizar o login do usuario sem o campo password', (done) => {
    const user = {
      email: 'teste@teste.com'
    }
    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('All fields must be filled');
      done();
    });
  });

  it('Não deve permitir realizar o login do usuario com email incorreta', (done) => {
    const user = {
      email: 'test@teste.com',
      password: 'teste'
    }
    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('Incorrect username or password');
      done();
    });
  });

  it('Não deve permitir realizar o login do usuario sem o campo email', (done) => {
    const user = {
      password: 'teste'
    }
    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('All fields must be filled');
      done();
    });
  });

});

describe('Teste relacionado ao usuario admin', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];
    await db.collection('users').insertMany(users);
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir cadastrar um usuário admin', (done) => {

    const user = {
      email: 'root@email.com',
      password: 'admin'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token
      const newUser = {
        name: 'Marina',
        email: 'marina@gmail.com',
        password: 'teste'
      }
      chai.request(app)
      .post('/users/admin')
      .set("Authorization",token)
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('user')
        res.body.user.should.have.property('name');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('role');
        res.body.user.should.not.have.property('password');
        done();
      })
    })
  });

  it('Não deve permitir o cadastro de admin por usuário que não tem permissão de admin', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token
      const newUser = {
        name: 'Marina',
        email: 'marina@gmail.com',
        password: 'teste'
      }
      chai.request(app)
      .post('/users/admin')
      .set("Authorization",token)
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message').equal('Only admins can register new admins')
        done();
      })
    })
  });

  it('Não deve permitir cadastrar o usuário admin sem o campo email', (done) => {

    const user = {
      email: 'root@email.com',
      password: 'admin'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token
      const newUser = {
        name: 'Marina',
        password: 'teste'
      }
      chai.request(app)
      .post('/users/admin')
      .set("Authorization",token)
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').equal('Invalid entries. Try again.');
        done();
      })
    })
  });

  it('Não deve permitir cadastrar o usuário admin com um email inválido', (done) => {

    const user = {
      email: 'root@email.com',
      password: 'admin'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token
      const newUser = {
        name: 'Marina',
        email: 'marina@dc',
        password: 'teste'
      }
      chai.request(app)
      .post('/users/admin')
      .set("Authorization",token)
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').equal('Invalid entries. Try again.');
        done();
      })
    })
  });

  it('Não deve permitir cadastrar um usuário admin com email já cadastrado', (done) => {

    const user = {
      email: 'root@email.com',
      password: 'admin'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token
      const newUser = {
        name: 'Marina',
        email: 'teste@teste.com',
        password: 'teste'
      }
      chai.request(app)
      .post('/users/admin')
      .set("Authorization",token)
      .send(newUser)
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eq('Email already registered');
        done();
      })
    })
  });
});
