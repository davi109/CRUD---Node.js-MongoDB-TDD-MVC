
const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoDbUrl = `mongodb://${process.env.HOST || 'mongodb'}:27017/Cookmaster`;

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const path = require('path');
const fs = require('fs');

chai.should();
chai.use(chaiHttp);

describe('Testes relacionados a criação de receitas', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');

    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];

    await db.collection('users').insertMany(users);
  });

  beforeEach(async () => {
    await db.collection('recipes').deleteMany({});
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir cadastrar uma receita', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {

      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('recipe')
        res.body.recipe.should.have.property('name');
        res.body.recipe.should.have.property('ingredients');
        res.body.recipe.should.have.property('preparation');
        res.body.recipe.should.have.property('userId');
        done();
      })
    })
  });

  it('Não deve permitir cadastrar uma receita sem usuário autenticado', (done) => {
    const recipe = {
      name: 'Macarronada',
      ingredients: 'Macarrão e molho',
      preparation: 'Mistura e vai pro fogo'
    }

    chai.request(app)
    .post('/recipes')
    .send(recipe)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('missing auth token');
      done();
    });
  });

  it('Não deve permitir cadastrar uma receita com token inválido', (done) => {
    const recipe = {
      name: 'Macarronada',
      ingredients: 'Macarrão e molho',
      preparation: 'Mistura e vai pro fogo'
    }

    chai.request(app)
    .post('/recipes')
    .set("Authorization",'eyio')
    .send(recipe)
    .end((err, res) => {
      res.should.have.status(401);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equal('jwt malformed');
      done();
    });
  });

  it('Não deve permitir cadastrar uma receita sem o campo ingredients', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {

      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').equals('Invalid entries. Try again.')
        done();
      })
    })
  });

});

describe('Testes relacionados a exibição de receitas', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');

    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];

    await db.collection('users').insertMany(users);
  });

  beforeEach(async () => {
    await db.collection('recipes').deleteMany({});
    const ListRecipes = [
      {
        name: 'Brigadeiro',
        ingredients: 'Leite condensado e chocolate',
        preparation: 'Misture os ingredientes em fogo baixo até ferver',
      },
      {
        name: 'Misto quente',
        ingredients: 'Pão, queijo e presunto',
        preparation: 'Colocar o pão com o queijo e presunto na chapa até derreter o queijo',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir exibir as receitas', (done) => {

    chai.request(app)
    .get('/recipes')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.be.equal(2)
      done();
    });

  });

  it('Deve permitir exibir uma receita específica', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, response) => {

      const token = response.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {

        const id = res.body.recipe._id;
        chai.request(app)
        .get(`/recipes/${id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name').equals('Macarronada');
          done();
        });
      });
    });
  });

  it('Não Deve permitir exibir uma receita com id inválido', (done) => {

    chai.request(app)
    .get(`/recipes/12`)
    .end((err, res) => {
      res.should.have.status(404);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equals('recipe not found');
      done();
    });
  });

  it('Não Deve permitir exibir uma receita com id inexistente', (done) => {

    chai.request(app)
    .get(`/recipes/24af12c3f4dff1caed782dc3`)
    .end((err, res) => {
      res.should.have.status(404);
      res.body.should.be.a('object');
      res.body.should.have.property('message').equals('recipe not found');
      done();
    });
  });
  
});

describe('Testes relacionados a edição de receitas', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');

    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];

    await db.collection('users').insertMany(users);
  });

  beforeEach(async () => {
    await db.collection('recipes').deleteMany({});
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir editar uma receita com usuário autenticado', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {

      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {
        const id = res.body.recipe._id;
        const newRecipe = {
          name: 'Macarronada',
          ingredients: 'Macarrão e molho',
          preparation: 'Mistura e vai pro fogo baixo'
        }
        chai.request(app)
        .put(`/recipes/${id}`)
        .set('Authorization',token)
        .send(newRecipe)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('preparation').equals('Mistura e vai pro fogo baixo');
          done();
        });
      });
    });
  });

  it('Não deve permitir editar uma receita por meio de um usuário não autorizado', (done) => {

    const user = {
      email: 'root@email.com',
      password: 'admin'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {

      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {
        recipeId= res.body.recipe._id;
        const newUser = {
          email: 'teste@teste.com',
          password: 'teste'
        }

        chai.request(app)
        .post('/login/')
        .send(newUser)
        .end((err, res) => {
          const newToken = res.body.token
    
          const newRecipe = {
            name: 'Macarronada',
            ingredients: 'Macarrão e molho',
            preparation: 'Mistura e vai pro fogo baixo'
          }
    
          chai.request(app)
          .put(`/recipes/${recipeId}`)
          .set('Authorization', newToken)
          .send(newRecipe)
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.have.property('message').equals('missing auth token');
            done();
          });
        });
      });
    });
  });

});

describe('Teste relacionado a exclusão de receitas', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');

    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];

    await db.collection('users').insertMany(users);
  });

  beforeEach(async () => {
    await db.collection('recipes').deleteMany({});
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir excluir uma receita com usuário autenticado', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login/')
    .send(user)
    .end((err, res) => {

      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set("Authorization",token)
      .send(recipe)
      .end((err, res) => {
        const id = res.body.recipe._id;
        chai.request(app)
        .delete(`/recipes/${id}`)
        .set('Authorization',token)
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.be.a('object');
          done();
        });
      });
    });
  });

});

describe('Teste relacionado a adição de imagens', () => {

  let connection;
  let db;

  before(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');

    const users = [
      { name: 'Admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Teste', email: 'teste@teste.com', password: 'teste', role: 'user' },
    ];

    await db.collection('users').insertMany(users);
  });

  beforeEach(async () => {
    await db.collection('recipes').deleteMany({});
  });

  after(async () => {
    await connection.close();
  });

  it('Deve permitir enviar foto com usuário autenticado', (done) => {

    const user = {
      email: 'teste@teste.com',
      password: 'teste'
    }

    chai.request(app)
    .post('/login')
    .send(user)
    .end((err, res) => {
      const token = res.body.token

      const recipe = {
        name: 'Macarronada',
        ingredients: 'Macarrão e molho',
        preparation: 'Mistura e vai pro fogo'
      }

      chai.request(app)
      .post('/recipes')
      .set('Authorization', token)
      .send(recipe)
      .end((err, res) => {
        const recipeId = res.body.recipe._id;

        chai.request(app)
        .put(`/recipes/${recipeId}/image`)
        .set('Authorization', token)
        .set('content-type', 'multipart/form-data')
        .attach('image', fs.readFileSync(`${__dirname}/../uploads/ratinho.jpg`), 'uploads/ratinho.jpeg')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        })
      })
    })

  });

});