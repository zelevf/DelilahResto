const express = require('express');
const bodyParser = require('body-parser');

const server = express();

server.use(bodyParser.json);

let users;



server.post('/login', (req, res) => {
    // email 
    const {user, password} = req.body;
});


server.listen(3000, () => console.log('Servidor iniciado, puerto 3000.'));