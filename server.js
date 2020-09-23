const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json);











// Crear un usuario - Ruta /usuarios
server.post('/usuarios', (req, res) => {
    let newUser = req.body;
    users.push(newUser);
    console.log('Se agregó un nuevo autor: ' + JSON.stringify(newUser));
    res.status(201).send(req.body);
})




server.post('/login', (req, res) => {
    // email 
    const {user, password} = req.body;
});

server.listen(8080, () => console.log('Servidor iniciado, puerto 8080.'));