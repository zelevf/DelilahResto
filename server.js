const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json);

// ----------------------------- USUARIOS -----------------------------------

let users;

// Obtener el listado clientes
server.get('/usuarios', (req, res) => {

    if (users == true) {
        res.json(users);
        console.log(users);
    } else {
        res.json("No hay usuarios registrados");
        console.log("No hay usuarios registrados");
    }
});

// Crear un usuario - Ruta /usuarios
server.post('/usuarios', (req, res) => {
    let newUser = req.body;
    users.push(newUser);
    console.log('Se agregó un nuevo cliente: ' + JSON.stringify(newUser));
    res.status(201).send(req.body);
})

server.post('/login', (req, res) => {
    // email 
    const {user, password} = req.body;
});




// ----------------------------- PEDIDOS -----------------------------------







// ----------------------------- PRODUCTOS -----------------------------------

// Obtener productos
server.get('/productos', (req, res) => {
    sequelize.query("select * from productos",
    {type: sequelize.QueryTypes.SELECT}
    ).then((resultados) => {
        res.json(resultados);
    })
});


// Obtener productos por su nombre (ESTO FUNCIONA PERFECTO)
server.get('/productos/:nombre', (req, res) => {
    const nombre = req.params.nombre;

    sequelize.query("select * from productos where nombre = :nombre",
    {replacements: {nombre}, type: sequelize.QueryTypes.SELECT}
    ).then((resultados) => {
        res.json(resultados);
    })

});

// Agregar productos como administrador y funciona perfecto (creo que le faltaria el middleware)
// server.post('/productos', (req, res) => {
//     const {nombre, descripcion, precio, stock} = req.body;
//     if(!nombre || !descripcion || !precio || !stock) {
//         res.status(404).send({err: "Faltan parámetros"});
//     } else {
//         sequelize.query("insert into productos (nombre, descripcion, precio, stock) value (?,?,?,?)", 
//         {replacements: [nombre, descripcion, precio, stock]}
//         ).then(function(result) {
//             res.status(202).send({producto: result})
//         })
//     }
// });

server.post('/productos', (req, res) => {
    sequelize.query("insert into productos (nombre, descripcion, precio, stock) value (?,?,?,?)",
        {replacements: [nombre, descripcion, precio, stock]}
    ).then(function(result) {
        console.log(result);
        res.status(202).send({producto: result})
    })
});


// ---------------------------- CARRITO -----------------------------------


// ----------------------------- ÓRDENES -----------------------------------












// ---------- FALTA POR ORDENAR -------------------

// Creando una cuenta y agregando un cliente (creo que le faltaria el middleware)
server.post('/cliente', (req, res) => {
    console.log(req.body);
    const {usuario, nombre, apellido, email, telefono, direccion, contraseña} = req.body;
    sequelize.query('isert into clientes (usuario, nombre, apellido, email, telefono, direccion, contraseña) values (?,?,?,?,?,?,?)',   
        {replacements: [usuario, nombre, apellido, email, telefono, direccion, contraseña]}
        ).then ((respuesta) => {
            console.log(respuesta)
            res.sendStatus(200);
        }); 
})


// Login (creo que le faltaria el middleware)
server.post('/login', (req, res) => {
    console.log(req.body);
    const usuario = req.body;
    const email = req.body;
    const contraseña = req.body;

    if ((usuario == "zelevf" || email == "fernandoveleze@gmail.com") && contraseña == "A.123456") {
        res.json("Acceso correcto")
    } else {
        res.sendStatus(401);
        res.json("Usuario o clave incorrecta");
    }
})





server.listen(8080, () => console.log('Servidor iniciado, puerto 8080.'));