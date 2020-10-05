const express = require('express');

const server = express();
// const dataBase = require('./delilahDB');

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/Delilah');
 
// ----------------------------- MIDDLEWARE -----------------------------------
// GENERALES
// Que no hayan parámetros de más en la ruta o path: 
function validarRuta(req, res, next) {
    console.log(req.query);
    console.log(req.body);

    if (Object.keys(req.query).length > 0) {
        res.statusCode = 400;
        res.json("Parámetros de más en la ruta");
    } else {
        next();
    }
}
server.use(bodyParser.json());
server.use(validarRuta);



// ESPECÍFICOS

// function validarBody(req, res, next) {
//     // server.use(bodyParser.json());
//     if(true) {
//         // AQUI IRIA ALGO INDICANDO QUE NO SE CUMPLE CON LAS CONDICIONES
//         // res.json("Acceso denegado!!!");
//     } else {
//     // AQUI IRIAN LAS FUNCIONES PORQUE SE CUMPLE CON LAS CONDICIONES
//     }
// }









// ----------------------------- TOKEN -----------------------------------
function validarUsuario(req, res, next) {

    let token = req.headers.authorization.split(" ")[1];
    let validUser = jwt.verify(token, firma)

    // // EN EL IF, FALTA COMPARAR EL USUARIO Y EL PASSWORD CON LA BASE DE DATOS 
    if(validUser) {
        res.locals.validUser = validUser;
        next();
    } else {
        res.status(400)
        res.json({error: "Token inválido"});
    }
    console.log(`Acceso permitido ${validUser}`);
    next();
}










// ----------------------------- USUARIOS -----------------------------------


// OBTENER LISTA DE PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO)
server.get('/usuarios/', (req, res) => {
    if(sequelize) {
        res.status(200);
        sequelize.query('select * From cliente',
            { type: sequelize.QueryTypes.SELECT }
        ).then(function (resultados) {
            res.json(resultados)
        });
    } else {
        res.status(404);
        res.json({Error: "No hay usuarios registrados"});
    }
});

// OBTENER USUARIOS POR SU NOMBRE CON QUERY (ESTO PUEDE IR PARA UNA LUPA PARA BUSCAR PRODUCTO)
server.get('/usuarios/', (req, res) => {
    let nombreRecibido = req.query.nombre;

    sequelize.query('select * From cliente where nombre = :nombre',
    { replacements: {nombre: nombreRecibido}, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        res.status(200).send({
            result
        });
    });
});
// RESUMIR ESTOS DOS PRIMEROS DE ARRIBA EN UNO SOLO 



// AGREGAR USUARIOS SIN VALIDACION (FUNCIONA PERFECTO)
server.post('/usuarios/', (req, res) => {
    const {usuario, password, nombre, email, telefono, direccion} = req.body;
    sequelize.query("INSERT INTO cliente (usuario, password, nombre, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)",
    {replacements: [usuario, password, nombre, email, telefono, direccion]}
        ).then((resultados) => {
            console.log(`Usuario agregado con éxito ${resultados}`)
            res.json('Agregado con éxito');
        });
});

// ACTUALIZAR USUARIOS SIN VALIDACION (NO FUNCIONA)
server.put('/usuarios/', (req, res) => {

});

// OBTENER USUARIOS POR SU NOMBRE EXACTO (ME FALTA FILTRAR QUE DE ERROR CUANDO NO HAY ID CARGADO) NO CREO NECESITAR ESTE
server.get('/usuarios/:nombre', (req, res) => {
    let nombreRecibido = req.params.nombre;

    sequelize.query('select * From cliente where nombre = :nombre',
    { replacements: {nombre: nombreRecibido}, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        res.status(200).send({
            result
        });
    });
});

// OBTENER USUARIOS POR SU ID (ME FALTA FILTRAR QUE DE ERROR CUANDO NO HAY ID CARGADO)
server.get('/usuarios/:id', (req, res) => {
    let idUsuario = req.params.id;

    sequelize.query('select * From cliente where id = :id',
    { replacements: {id: idUsuario}, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        res.status(200).send({
            result
        });
    });
});

////////////////////////////////////////







let firma = "clave";

server.post('/login', (req, res) => {
    const {user, password} = req.body;

    if(user == "zelevf" && password == "Ale12345") {
        let token = jwt.sign(user, firma);
        res.json(token);
    } else {
        res.json({error: "Datos de acceso incorrectos"});
    }

})

server.post('/home', validarUsuario, (req, res) => {
    res.send(`Hola ${res.locals.validUser}, bienvenido`);
})



 
















// ----------------------------- PRODUCTOS -----------------------------------

// OBTENER LISTA DE PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO)
server.get('/productos/', (req, res) => {
    if(sequelize) {
        res.status(200);
        sequelize.query('select * From Productos',
            { type: sequelize.QueryTypes.SELECT }
        ).then(function (resultados) {
            res.json(resultados)
        });
    } else {
        res.status(404);
        res.json({Error: "No hay productos registrados"});
    }
});

// OBTENER PRODUCTOS POR SU ID SIN VALIDACION (FUNCIONA, PERO FALTA QUE CUANDO NO CONSIGA EL ID DE ERROR)
server.get('/productos/:id', (req, res) => {
    let idProductos = req.params.id;

    sequelize.query('select * From productos where idProductos = :id',
    { replacements: {id: idProductos}, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        res.status(200).send({
            result
        });
    });
});


// AGREGAR PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO)
server.post('/productos/', (req, res) => {
    const {nombre, descripcion, precio, stock} = req.body;
    sequelize.query("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
    {replacements: [nombre, descripcion, precio, stock]}
        ).then((resultados) => {
            console.log(`Producto agregado con éxito ${resultados}`)
            res.json('Agregado con éxito');
        });
});

// -----------------------------------------------------------------------




server.use((err, req, res, next) => {
    if(!err) {
        next();
    } else {
    console.log('Error, algo salió mal', err);
    res.status(500).send('Error');
    }
});


server.listen(8080, () => console.log('Servidor iniciado, puerto 8080.')); 