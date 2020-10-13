const express = require('express');
const server = express();
// const dataBase = require('./delilahDB');

const bodyParser = require('body-parser');
server.use(bodyParser.json());

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


function validarUsuarioAdmin(req, res, next) {
    let token = req.headers.authorization.split(" ")[1];
    let validUser = jwt.verify(token, validPassword)

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

function validarUsuarioCliente(req, res, next) {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let validUser = jwt.verify(token, passwordJWT);
    
        if(validUser) {
            res.locals.validUser = validUser;
            next();
        }
    } catch {
        res.json({error: "Token inválido"});
    }
}


// ----------------------------- REGISTRO DE USUARIOS -----------------------------------

// AGREGAR USUARIOS, NO SE PUEDAN AGREGAR DOS IGUALES (FUNCIONA PERFECTO)
server.post('/registro/', (req, res) => {
    const {usuario, password, nombre, email, telefono, direccion} = req.body;

    sequelize.query('select * From cliente where usuario = :usuario',
        { replacements: { usuario: usuario }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result < 1) {

            sequelize.query("INSERT INTO cliente (usuario, password, nombre, email, telefono, direccion, tipoUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
                { replacements: [usuario, password, nombre, email, telefono, direccion, 0] }
            ).then(() => {
                res.status(200)
                res.json({resultados: "Usuario agregado exitosamente"});
            });
        } else {
            res.status(400)
            res.json({ error: "Este usuario ya existe" })
        }
    });
});



// ----------------------------- LOGIN DE USUARIOS -----------------------------------

// ESTO ESTA LISTO Y FUNCIONA
server.post('/login', (req, res) => {
    let usuarioRecibido = req.body.usuario;
    let passwordRecibido = req.body.password;
    passwordJWT = passwordRecibido;

    sequelize.query('select * From cliente where usuario = :usuario and password = :password',
    { replacements: {usuario: usuarioRecibido, password: passwordRecibido}, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if(result < 1) {
            res.status(400);
            res.json({error: "Datos incorrectos"});            
        } else {
            let token = jwt.sign(usuarioRecibido, passwordRecibido);
            res.json({token});
        }
    });
})


// ESTO ES UN EJEMPLO DE UNA RUTA PARA VER QUE FUNCIONA BIEN, TAMBIEN PUEDE SER EL HOME PERO AUTENTICADO 
server.get('/', validarUsuarioCliente, (req, res) => {
    res.send(`Hola ${res.locals.validUser}, bienvenido`);
})




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
// server.get('/usuarios/', (req, res) => {
//     let nombreRecibido = req.query.nombre;

//     sequelize.query('select * From cliente where nombre = :nombre',
//     { replacements: {nombre: nombreRecibido}, type: sequelize.QueryTypes.SELECT }
//     ).then(function (result) {
//         res.status(200).send({
//             result
//         });
//     });
// });
// RESUMIR ESTOS DOS PRIMEROS DE ARRIBA EN UNO SOLO 



// OBTENER USUARIOS POR SU ID (ME FALTA FILTRAR QUE DE ERROR CUANDO NO HAY ID CARGADO)
// server.get('/usuarios/:id', (req, res) => {
//     let idUsuario = req.params.id;

//     sequelize.query('select * From cliente where id = :id',
//     { replacements: {id: idUsuario}, type: sequelize.QueryTypes.SELECT }
//     ).then(function (result) {
//         res.status(200).send({
//             result
//         });
//     });
// });




server.get('/usuarios/:id', (req, res) => {
    let idUsuario = req.params.id;

    sequelize.query('select id From cliente where usuario = :usuario',
        { replacements: { id: res.locals.validUser }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result == idUsuario) {
            sequelize.query('select * From cliente where id = :id',
            { replacements: {id: idUsuario}, type: sequelize.QueryTypes.SELECT }
            ).then(function (result) {
                res.status(200).send({
                    result
                });
            });
        } else {
            res.json({error: "Este usuario no está permitido"})
        }
    });
});

// res.status(200).send({
//     result
// });



// ACTUALIZAR USUARIOS SIN VALIDACION (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.put('/usuarios/:id', (req, res) => {
    let idRecibido = req.params.id;
    let nombreRecibido = req.body.nombre;
    let emailRecibido = req.body.email;
    let telefonoRecibido = req.body.telefono;
    let direccionRecibido = req.body.direccion;
    let tipoUsuarioRecibido = req.body.tipoUsuario;

    if(nombreRecibido) {
        sequelize.query('UPDATE cliente set nombre = :nombre where id = :id',
            { replacements: {nombre: `${nombreRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(emailRecibido) {
        sequelize.query('UPDATE cliente set email = :email where id = :id',
            { replacements: {email: `${emailRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(telefonoRecibido) {
        sequelize.query('UPDATE cliente set telefono = :telefono where id = :id',
            { replacements: {telefono: `${telefonoRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(direccionRecibido) {
        sequelize.query('UPDATE cliente set direccion = :direccion where id = :id',
            { replacements: {direccion: `${direccionRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(tipoUsuarioRecibido) {
        sequelize.query('UPDATE cliente set tipoUsuario = :tipoUsuario where id = :id',
            { replacements: {tipoUsuario: `${tipoUsuarioRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

});


// BORRAR USUARIOS SIN VALIDACION - ADMINISTRADOR (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.delete('/usuarios/', (req, res) => {
    let idRecibido = req.body.id;

    sequelize.query('DELETE from cliente where id = :id',
        { replacements: {id: `${idRecibido}`}}
    ).then(function (resultados) {
        res.json(resultados)
    });
});


// BORRAR USUARIOS SIN VALIDACION - CLIENTE (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.delete('/usuarios/:id', (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query('DELETE from cliente where id = :id',
        { replacements: {id: `${idRecibido}`}}
    ).then(function (resultados) {
        res.json(resultados)
    });
});




// ----------------------------- PRODUCTOS -----------------------------------

// ADMINISTRADOR FUNCIONA PERFECTO, FALTA VALIDACION


//////////////////////////// RUTA PRODUCTOS 

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

// BORRAR PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.delete('/productos/', (req, res) => {
    let idRecibido = req.body.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: {id: `${idRecibido}`}}
    ).then(function (resultados) {
        res.json(resultados)
    });
});




//////////////////////////// RUTA PRODUCTOS:ID 

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

// ACTUALIZAR PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.put('/productos/:id', (req, res) => {
    let idRecibido = req.params.id;
    let nombreRecibido = req.body.nombre;
    let descripcionRecibido = req.body.descripcion;
    let precioRecibido = req.body.precio;
    let stockRecibido = req.body.stock;

    if(nombreRecibido) {
        sequelize.query('UPDATE productos set nombre = :nombre where idProductos = :id',
            { replacements: {nombre: `${nombreRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(descripcionRecibido) {
        sequelize.query('UPDATE productos set descripcion = :descripcion where idProductos = :id',
            { replacements: {descripcion: `${descripcionRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(precioRecibido) {
        sequelize.query('UPDATE productos set precio = :precio where idProductos = :id',
            { replacements: {precio: `${precioRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }

    if(stockRecibido) {
        sequelize.query('UPDATE productos set stock = :stock where idProductos = :id',
            { replacements: {stock: `${stockRecibido}`, id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    }
});

// BORRAR PRODUCTOS SIN VALIDACION (FUNCIONA PERFECTO, FALTA VALIDACION DE USUARIO)
server.delete('/productos/:id', (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: {id: `${idRecibido}`}}
    ).then(function (resultados) {
        res.json(resultados)
    });
});




// ----------------------------- PEDIDOS -----------------------------------

//////////////////////////// RUTA PEDIDOS
server.get('/pedidos/', (req, res) => {
    if(sequelize > 0) {
        res.status(200);
        sequelize.query('select * From Pedidos',
            { type: sequelize.QueryTypes.SELECT }
        ).then(function (resultados) {
            res.json(resultados)
        });
    } else {
        res.status(404);
        res.json({Error: "No hay pedidos registrados"});
    }
});

// HACER PEDIDOS SIN VALIDACION (FUNCIONA PERFECTO)
server.post('/pedidos/', (req, res) => {
    const {nuevoProducto} = req.body;

    sequelize.query("INSERT INTO pedidos (nuevo) VALUES (?, ?, ?, ?)",
    {replacements: [nombre, descripcion, precio, stock]}
        ).then((resultados) => {
            console.log(`Producto agregado con éxito ${resultados}`)
            res.json('Agregado con éxito');
        });
});


server.post('/productos/', (req, res) => {
    const {nombre, descripcion, precio, stock} = req.body;
    sequelize.query("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
    {replacements: [nombre, descripcion, precio, stock]}
        ).then((resultados) => {
            console.log(`Producto agregado con éxito ${resultados}`)
            res.json('Agregado con éxito');
        });
});













server.delete('/pedidos/', (req, res) => {
    let idRecibido = req.body.id;

    sequelize.query('DELETE from pedidos where id = :id',
        { replacements: {id: `${idRecibido}`}}
    ).then(function (resultados) {
        if(sequelize > 0) {
            res.json(resultados)
        } else {
            res.status(404);
            res.json({Error: "El pedido no existe"});
        }
    });
});






//////////////////////////// RUTA PEDIDOS:ID

server.get('/pedidos/:id', (req, res) => {
    let idRecibido = req.params.id;
    if(sequelize > 0) {
        res.status(200);
        sequelize.query('select * From Pedidos where id = :id',
            { replacements: {id: `${idRecibido}`}}
        ).then(function (resultados) {
            res.json(resultados)
        });
    } else {
        res.status(404);
        res.json({Error: "El pedido no existe"});
    }
});









// ----------------------------- FAVORITOS -----------------------------------





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