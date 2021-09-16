var express = require('express');
var router = express.Router();
var db = require('../util/db');
var verifyJWT = require('../middlewares/verifyJWT');
const jwt = require('jsonwebtoken');

/* Pagina inicial */
router.get('/', function (req, res) {
  res.render('index');
});

//autenticação
router.get('/login', (req, res, next) => {
  res.render('login');
})

//autenticação
router.post('/login', (req, res, next) => {
  db.query('SELECT * FROM cad_user WHERE username = ?', [req.body.username], function (erro, resultado) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    }
    user = resultado[0];

    //  esse teste abaixo sera feito no banco de dados
    if (user && user.password == req.body.password) {
      //auth ok
      const id = user.id; //esse id vem do banco de dados
      const token = jwt.sign({ id }, 'projeto_filmes_e_series', {
        expiresIn: '1d' // expira em 1 dia
      });
      return res.json({ auth: true, token: token, user });
    }

    return res.json({ auth: false, token: null });
  })
})

router.get('/logout', function (req, res) {
  res.clearCookie('x-access-token');
  res.clearCookie('user');
  res.redirect('/');
})

/*
rota para exibir uma mensagem
router.get('/mensagem', function (req, res) {
  res.render('mensagem', { mensagem: 'Você acessou a rota mensagem' })
});

Rota sem view de retorno
router.get('/mensagem2', function (req, res) {
  res.status(200).send('Oi fulando, Você acessou a rota sem view mensagem 2');
});*/

//Rota que ira listar os filmes e séries armazenados no database
router.get('/listar', verifyJWT, function (req, res) {
  db.query('SELECT * FROM filmes_e_series ORDER BY ano_lancamento, titulo', [], function (erro, resultado) {
    if (erro) {
      res.status(400).send(erro)
    }
    res.render('lista', { lista: resultado })
  });
});

//Rota para acessar form de usuarios
router.get('/cad', function (req, res) {
  res.render('caduser', { use: {} });
});

//Rota que ira acessar o form de usuarios e series para inserir novos usuários
router.post('/cad', function (req, res) {
  db.query('INSERT INTO users(nome,sobrenome,username,idade) VALUES(?,?,?,?)', [req.body.nome, req.body.sobrenome, req.body.username, req.body.idade, req.body.password], function (erro) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    }
    res.redirect('/')
  });
});

//Rota para acessar form de cadastro
router.get('/add', verifyJWT, function (req, res) {
  res.render('form', { filme: {} });
});

//Rota que ira acessar o form de cadastro de filmes e series para inserir novos
router.post('/add', verifyJWT, function (req, res) {
  db.query('INSERT INTO filmes_e_series(titulo,ano_lancamento) VALUES(?,?)', [req.body.titulo, req.body.ano], function (erro) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    }
    res.redirect('/listar')
  });
});

//Rota para buscar o filme/serie para edição
router.get('/edit/:id', verifyJWT, function (req, res) {
  db.query('SELECT * FROM filmes_e_series WHERE id = ?', [req.params.id], function (erro, resultado) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    }
    res.render('form', { filme: resultado[0] });
  })
});

//Rota para receber dados do database para editar
router.post('/edit/:id', verifyJWT, function (req, res) {
  db.query('UPDATE filmes_e_series SET titulo = ?, ano_lancamento = ? WHERE id = ?', [req.body.titulo, req.body.ano, req.params.id], function (erro) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    }
    res.redirect('/listar')
  });
});

//Rota para receber o id do filme/serie que será excluído no database
router.delete('/delete/:id', verifyJWT, function (req, res, next) {
  db.query('DELETE FROM filmes_e_series WHERE id = ?', [req.params.id], function (erro) {
    if (erro) {
      res.status(400).send('Erro: ' + erro)
    } else {
      res.status(200).send('OK');
    }

  });
});
module.exports = router;
