const express = require('express');
const session = require("express-session");
const path = require('path');
const bodyParser = require("body-parser");
const mysql = require("mysql");
const exphbs = require('express-handlebars');

const app = express();

// Configurar sessões
app.use(session({ secret: "ssshhhhh", resave: false, saveUninitialized: true }));

// Servir arquivos estáticos
app.use('/public', express.static('public'))

// Configurar Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    extname: '.handlebars'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Função para conectar ao banco de dados
function connectiondb() {
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'academicmanager'
    });

    con.connect((err) => {
        if (err) {
            console.log('Erro ao conectar banco de dados', err);
            return;
        }
        console.log('Conexão estabilizada!');
    });

    return con;
}

// Rotas
app.get('/', (req, res) => {
    req.session.destroy();
    res.render('login', { message: '' });
});

app.get('/views/login', (req, res) => {
    res.render('login', { message: '' });
});

app.post('/log', (req, res) => {
    var email = req.body.email;
    var pass = req.body.pass;
    var con = connectiondb();
    var query = 'SELECT * FROM users WHERE pass = ? AND email = ?';

    con.query(query, [pass, email], function (err, results) {
      if (results.length > 0) {
          req.session.user = email;
          var role = results[0].role;
          if (role === 'coordenador') {
              res.redirect('/coordenador');
          } else if (role === 'aluno') {
              res.redirect('/aluno');
          } else if (role === 'responsavel') {
              res.redirect('/responsavel'); 
          } else if (role === 'diretor') {
              res.redirect('/diretor'); 
          } else if (role === 'orientador') {
              res.redirect('/orientador'); 
          } else {
            res.render('error', { message: 'usuário não encontrado.' });
          }
      } else {
          res.render('login', { message: 'Login incorreto!' });
      }
    });
});

app.get('/coordenador', (req, res) => {
    if (req.session.user) {
        res.render('coordenador', { user: req.session.user });
    } else {
        res.redirect('/');
    }
});

app.get('/aluno', (req, res) => {
    if (req.session.user) {
        res.render('aluno', { user: req.session.user });
    } else {
        res.redirect('/');
    }
});

app.get('/responsavel', (req, res) => {
  if (req.session.user) {
      res.render('responsavel', { user: req.session.user });
  } else {
      res.redirect('/');
  }
});

app.get('/diretor', (req, res) => {
  if (req.session.user) {
      res.render('diretor', { user: req.session.user });
  } else {
      res.redirect('/');
  }
});

app.get('/orientador', (req, res) => {
  if (req.session.user) {
      res.render('orientador', { user: req.session.user });
  } else {
      res.redirect('/');
  }
});

// Iniciar o servidor
app.listen(8081, () => console.log(`Servidor Ativo!`));
