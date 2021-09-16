const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'tcc',
    password: '1234',
    port: 3306,
    database: 'projeto',
    multipleStatements: true
});

//Conexão com o database
db.connect((erro) => {
    if (erro) {
        throw erro;
    }
    console.log(`Conectado ao banco de dados projeto`)
})

//global.db = db; 

module.exports = db;
