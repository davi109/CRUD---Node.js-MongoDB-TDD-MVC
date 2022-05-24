# Exemplo de programa para gerenciamento de receitas

Projeto criado para demonstrar um CRUD feito em Node.js, utilizando a arquitetura MVC e TDD, para realizar o cadastro de receitas de cozinha!


<h2 align="center">Procedimentos para instalação</h2>

Primeiramente, clone este repositório!

<h3 align="left">1 - Banco de dados</h3>

Configure um servidor de banco de dados MongoDB e crie uma database nomeada Cookmaster com as collections: users e recipes.

<h3 align="left">2 - Node.js</h3>

Para que seja possível a instalação do controlador, é necessário que o servidor que estará rodando o serviço tenha o node.js instalado:
Link para instalação: https://nodejs.org/en/download/package-manager/

<h3 align="left">3 - Instalação e configuração do server</h3>

Após as etapas acima, acesse a pasta raiz do projeto e crie o arquivo `.env`. Depois, insira
seus 'pares de chave'/'valor' no seguinte formato de `KEY = VALUE`:

```sh
#Development
DB_HOST=localhost
PORT=3000

```
Configurado as váriaveis ambiente, execute os seguintes comandos abaixo para finalizar a instalação e iniciar o server: 

```bash
# Acesse a pasta do projeto no terminal/cmd
$ cd Nome-da-pasta

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm start

```

Para realização de testes e validação do código:

```bash
# Para testar os requisitos
$ npm run test

#Para testar a cobertura do teste
$ npm run test:coverage

#Para validação do código pelo Eslint
$ npm run lint
```

### 🛠 Tecnologias utilizadas

As seguintes ferramentas foram usadas na construção do projeto:

- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/en/)
- [JsonWebToken](https://jwt.io/)
- [MongoDB](https://www.mongodb.com/)
- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [Multer](https://www.npmjs.com/package/multer)
- [Eslint](https://eslint.org/)