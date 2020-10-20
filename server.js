const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(bodyParser.json());

const jwt = require('jsonwebtoken');
 
const moment = require('moment');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/DelilahFV');


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
    if (tipoUsuario == 1) {
        let token = req.headers.authorization.split(" ")[1];
        let validUser = jwt.verify(token, passwordJWT);

        if (validUser) {
            res.locals.validUser = validUser;
            next();
        }
    } else {
        res.json({ error: "Error en validar usuario" });
    }
}

function validarUsuarioCliente(req, res, next) {

    if (tipoUsuario == 0) {
        let token = req.headers.authorization.split(" ")[1];
        let validUser = jwt.verify(token, passwordJWT);

        if (validUser) {
            res.locals.validUser = validUser;
            next();
        }
    } else {
        res.json({ error: "Error en validar usuario" });
    }
}



// ----------------------------- REGISTRO DE USUARIOS -----------------------------------

// AGREGAR USUARIOS, NO SE PUEDAN AGREGAR DOS IGUALES (PERFECTA, REVISADA)
server.post('/registro/', (req, res) => {
    const { usuario, password, nombre, email, telefono, direccion } = req.body;

    sequelize.query('select * From cliente where usuario = :usuario',
        { replacements: { usuario: usuario }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result < 1) {
            sequelize.query("INSERT INTO cliente (usuario, password, nombre, email, telefono, direccion, tipoUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
                { replacements: [usuario, password, nombre, email, telefono, direccion, 0] }
            ).then(() => {
                res.status(200)
                res.json({ resultados: "Usuario agregado exitosamente" });
            });
        } else {
            res.status(400)
            res.json({ error: "Este usuario ya existe" })
        }
    });
});



// ----------------------------- LOGIN DE USUARIOS -----------------------------------

// (PERFECTA, REVISADA)
let tipoUsuario;
server.post('/login', (req, res) => {
    let usuarioRecibido = req.body.usuario;
    let passwordRecibido = req.body.password;
    passwordJWT = passwordRecibido;

    sequelize.query('select * From cliente where usuario = :usuario and password = :password',
        { replacements: { usuario: usuarioRecibido, password: passwordRecibido }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result < 1) {
            res.status(400);
            res.json({ error: "Datos incorrectos" });
        } else {
            tipoUsuario = result[0].tipoUsuario;
            res.locals.tipoUsuario = tipoUsuario;
            let token = jwt.sign(usuarioRecibido, passwordRecibido);
            res.json({ token });
        }
    });
})



// ----------------------------- USUARIOS -----------------------------------

// OBTENER LISTA DE USUARIOS (PERFECTA, REVISADA)
server.get('/usuarios/', validarUsuarioAdmin, (req, res) => {

    sequelize.query('select * From cliente where tipoUsuario = 0',
        { type: sequelize.QueryTypes.SELECT }
    ).then(function (resultados) {
        console.log(resultados)
        console.log(Object.keys(resultados).length === 0)
        console.log(Object.keys(resultados))

        if (Object.keys(resultados).length < 1) {
            res.status(404);
            res.json({ Error: "No hay usuarios registrados" });
        } else {
            res.status(200);
            res.json(resultados)
        }
    });

});

// OBTENER USUARIOS POR SU ID (PERFECTA, REVISADA)
server.get('/usuarios/:id', validarUsuarioCliente, (req, res) => {
    let idUsuario = req.params.id;

    sequelize.query('select * From cliente where id = :id',
        { replacements: { id: idUsuario }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result > 0) {
            res.status(400);
            res.json({ error: "La información que deseas obtener no está disponible" })
        } else {
            if (result < 1) {
                res.status(400);
                res.json({ error: "La información no está disponible" })
            } else {
                if (res.locals.validUser != result[0].Usuario) {
                    res.status(400);
                    res.json({ error: "No tienes permisos" })
                } else {
                    res.status(200).send({
                        result
                    });
                }
            }
        }
    });
});

// ACTUALIZAR USUARIOS (PERFECTA, REVISADA)
server.put('/usuarios/:id', validarUsuarioCliente, (req, res) => {
    let idRecibido = req.params.id;
    let nombreRecibido = req.body.nombre;
    let emailRecibido = req.body.email;
    let telefonoRecibido = req.body.telefono;
    let direccionRecibido = req.body.direccion;
    let tipoUsuarioRecibido = req.body.tipoUsuario;

    if (nombreRecibido) {
        sequelize.query('UPDATE cliente set nombre = :nombre where id = :id',
            { replacements: { nombre: `${nombreRecibido}`, id: `${idRecibido}` } }
        ).then(function (resultados) {
            if (!resultados) {
                res.status(500);
                res.json("Error interno, no pudimos procesar tu solicitud");
            } else {
                res.status(200);
                res.json("Nombre modificado exitosamente");
            }
        });
    }

    if (emailRecibido) {
        sequelize.query('UPDATE cliente set email = :email where id = :id',
            { replacements: { email: `${emailRecibido}`, id: `${idRecibido}` } }
        ).then(function (resultados) {
            if (!resultados) {
                res.status(500);
                res.json("Error interno, no pudimos procesar tu solicitud");
            } else {
                res.status(200);
                res.json("Email modificado exitosamente");
            }
        });
    }

    if (telefonoRecibido) {
        sequelize.query('UPDATE cliente set telefono = :telefono where id = :id',
            { replacements: { telefono: `${telefonoRecibido}`, id: `${idRecibido}` } }
        ).then(function (resultados) {
            if (!resultados) {
                res.status(500);
                res.json("Error interno, no pudimos procesar tu solicitud");
            } else {
                res.status(200);
                res.json("Teléfono modificado exitosamente");
            }
        });
    }

    if (direccionRecibido) {
        sequelize.query('UPDATE cliente set direccion = :direccion where id = :id',
            { replacements: { direccion: `${direccionRecibido}`, id: `${idRecibido}` } }
        ).then(function (resultados) {
            if (!resultados) {
                res.status(500);
                res.json("Error interno, no pudimos procesar tu solicitud");
            } else {
                res.status(200);
                res.json("Dirección modificada exitosamente");
            }
        });
    }

    if (tipoUsuarioRecibido) {
        sequelize.query('UPDATE cliente set tipoUsuario = :tipoUsuario where id = :id',
            { replacements: { tipoUsuario: `${tipoUsuarioRecibido}`, id: `${idRecibido}` } }
        ).then(function (resultados) {
            if (!resultados) {
                res.status(500);
                res.json("Error interno, no pudimos procesar tu solicitud");
            } else {
                res.status(200);
                res.json("Tipo de usuario modificado exitosamente");
            }
        });
    }

});
 

// BORRAR USUARIO - CLIENTE (PERFECTA, REVISADA)
server.delete('/usuarios/:id', validarUsuarioCliente, (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        let Cliente_id = Cliente_idRecibido[0].id;

        if (Cliente_id != idRecibido) {
            res.status(400)
            res.json({ Error: "No tienes permisos" })
        } else {
            sequelize.query('DELETE from cliente where id = :id',
                { replacements: { id: `${idRecibido}` } }
            ).then(function (resultados) {
                res.json(resultados)
            });
        }
    })
});



// ----------------------------- PRODUCTOS -----------------------------------

// OBTENER LISTA DE PRODUCTOS SIN VALIDACION (PERFECTA, REVISADA)
server.get('/productos/', (req, res) => {
    if (sequelize) {
        sequelize.query('select * From Productos',
            { type: sequelize.QueryTypes.SELECT }
        ).then(function (resultados) {
            res.status(200);
            res.json(resultados)
        });
    } else {
        res.status(404);
        res.json({ Error: "No hay productos registrados" });
    }
});

// AGREGAR PRODUCTOS - ADMINISTRADOR (PERFECTA, REVISADA)
server.post('/productos/', validarUsuarioAdmin, (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    sequelize.query("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
        { replacements: [nombre, descripcion, precio, stock] }
    ).then((resultados) => {
        console.log(`Producto agregado con éxito ${resultados}`)
        res.json('Agregado con éxito');
    });
});

// BORRAR PRODUCTOS - ADMINISTRADOR (PERFECTA, REVISADA)
server.delete('/productos/', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.body.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function (resultados) {
        console.log(resultados)
        res.status(200)
        res.json("Producto eliminado")
    });
});


//////////////////////////// RUTA PRODUCTOS:ID 

// OBTENER PRODUCTOS POR SU ID (PERFECTA, REVISADA)
server.get('/productos/:id', (req, res) => {
    let idProductos = req.params.id;

    sequelize.query('select * From productos where idProductos = :id',
        { replacements: { id: idProductos }, type: sequelize.QueryTypes.SELECT }
    ).then(function (result) {
        if (result < 1) {
            res.status(400);
            res.json({ error: "El producto no existe" })
        } else {
            res.status(200).send({
                result
            });
        }
    });
});


// ACTUALIZAR PRODUCTOS - ADMINISTRADOR (PERFECTA, REVISADA)
server.put('/productos/:id', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.params.id;
    let nombreRecibido = req.body.nombre;
    let descripcionRecibido = req.body.descripcion;
    let precioRecibido = req.body.precio;
    let stockRecibido = req.body.stock;

    if (nombreRecibido) {
        sequelize.query('UPDATE productos set nombre = :nombre where idProductos = :id',
            { replacements: { nombre: `${nombreRecibido}`, id: `${idRecibido}` } }
        ).then(function () {
            res.status(200)
            res.json("Nombre modificado exitosamente")
        });
    }

    if (descripcionRecibido) {
        sequelize.query('UPDATE productos set descripcion = :descripcion where idProductos = :id',
            { replacements: { descripcion: `${descripcionRecibido}`, id: `${idRecibido}` } }
        ).then(function () {
            res.status(200)
            res.json("Descripción modificada exitosamente")
        });
    }

    if (precioRecibido) {
        sequelize.query('UPDATE productos set precio = :precio where idProductos = :id',
            { replacements: { precio: `${precioRecibido}`, id: `${idRecibido}` } }
        ).then(function () {
            res.status(200)
            res.json("Precio modificado exitosamente")
        });
    }

    if (stockRecibido) {
        sequelize.query('UPDATE productos set stock = :stock where idProductos = :id',
            { replacements: { stock: `${stockRecibido}`, id: `${idRecibido}` } }
        ).then(function () {
            res.status(200)
            res.json("Stock modificado exitosamente")
        });
    }
});

// BORRAR PRODUCTOS - ADMINISTRADOR (PERFECTA, REVISADA)
server.delete('/productos/:id', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function () {
        res.status(200)
        res.json("Producto eliminado del stock exitosamente")
    });
});




// ----------------------------- ÓRDENES - ADMINISTRADOR-----------------------------------

//////////////////////////// RUTA ÓRDENES
// // (PERFECTA, REVISADA)
server.get('/ordenes/', validarUsuarioAdmin, (req, res) => {
    sequelize.query('SELECT *, Pedidos_Productos.* FROM Pedidos JOIN Pedidos_Productos ON Pedidos_Productos.Cliente_id = Pedidos.Cliente_id',
        { type: sequelize.QueryTypes.SELECT }
    ).then(function (resultados) {
        if (resultados < 1) {
            res.status(404);
            res.json({ Error: "No hay órdenes registradas" });
        } else {
            res.status(200);
            res.json(resultados)
        }
    });
});
 


// (PERFECTA, REVISADA)
server.put('/ordenes/', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.body.id;
    let estadoRecibido = req.body.estado;

    sequelize.query('select Estados_id From Pedidos',
    ).then(function (resultados) {
        let nuevo = resultados[0];
        console.log(nuevo[0].Estados_id)
        if (nuevo[0].Estados_id < 5) {
            sequelize.query(`UPDATE Pedidos set Estados_id = ${estadoRecibido} where id = ${idRecibido}`,
            ).then(function () {
                res.status(200)
                res.json("Has modificado el estado de la orden.")
            });
        } else {
            res.status(400);
            res.json({ error: "No puedes realizar cambios a la orden" })
        }
    });
}); 


//////////////////////////// RUTA ÓRDENES:ID (PERFECTA, REVISADA)
server.get('/ordenes/:id', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.params.id;
    sequelize.query('select * From Pedidos where id = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function (resultados) {
        console.log(resultados[0])
        let orden = resultados[0];
        console.log(orden[0].id)
        if (orden[0].id > 0) {
            res.status(200);
            res.json(resultados)
    
        } else {
            res.status(404);
            res.json({ Error: "La orden no existe" });
        }
    });

});























// ----------------------------- PEDIDOS - CLIENTE -----------------------------------

//////////////////////////// RUTA PEDIDOS
// (PERFECTA, REVISADA)
server.get('/pedidos/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log("Aqui me dice el ID");
        console.log(Cliente_idRecibido[0].id);
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`SELECT * FROM Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
            ).then(function (resultados) {
                console.log(Object.keys(resultados[0].length))
                console.log("LEER JUSTO AQUI ARRIBA")
                // res.json(resultados[0])
                if (Object.keys(resultados[0]).length === 0) {
                    console.log("LEER JUSTO AQUI ARRIBA")
                    res.status(404);
                    res.json({ error: "No hay pedidos registrados" })
                } else {
                    res.status(200);
                    res.json(resultados[0])
                }
            });
        }
    }); 
});




// // // HACER PEDIDOS SIN VALIDACION (NO FUNCIONA)
// server.post('/pedidos/', validarUsuarioCliente, (req, res) => {
//     let FechaRecibido = moment();
//     let FormaDePagoRecibido = req.body.FormaDePago;
//     let PrecioTotalRecibido = req.body.PrecioTotal;

//     let CompraRecibido = JSON.stringify(FechaRecibido);
//     console.log(CompraRecibido)
//     console.log("AQUI 0")

//     sequelize.query(`select id From Cliente where Usuario = :Usuario`,
//         { replacements: { Usuario: `${res.locals.validUser}` } }
//     ).then(function (resultados) {
//         let Cliente_idRecibido = resultados[0];
//         console.log("AQUI 1")
//         console.log(Cliente_idRecibido[0].id);
//         if (Cliente_idRecibido[0].id < 1) {
//             res.status(500)
//             res.json("Error interno, intenta más tarde");
//         } else {
//             sequelize.query(`select id From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
//             ).then(function (resultados) {
//                 console.log(resultados[0])
//                 // res.json(resultados);
//                 console.log("AQUI 2")

//                 if (Object.keys(resultados[0].length === 0)) {
//                     console.log("Felicidades es tu primera compra");
//                     console.log("AQUI 3")
//                     sequelize.query("INSERT INTO Pedidos (Fecha, PrecioTotal, Estados_id, FormaDePago, Cliente_id) VALUES (?, ?, ?, ?, ?)",
//                         { replacements: [`${FechaRecibido}`, PrecioTotalRecibido, 1, FormaDePagoRecibido, Cliente_idRecibido[0].id] }
//                     ).then((resultados) => {
//                         console.log(resultados)
//                         res.json(resultados)
//                         console.log("AQUI 4")
//                         // let number = resultados;
//                         sequelize.query(`Update Pedidos_Productos set Compra = ${CompraRecibido} where Compra = 0`,
//                         ).then((resultados) => {
//                             res.json({ "resultados": "Tu compra fue realizada exitosamente" })
//                         });

//                     });
//                 } else {
//                     console.log("AQUI 5")
//                     console.log("Nos alegra que compraras otra vez");
//                 }
//             })
//         }
//     });
// });




// ESTA DEBERIA FUNCIONAR 

// server.post('/pedidos/', validarUsuarioCliente, (req, res) => {
//     let FechaRecibido = moment();

//     let FormaDePagoRecibido = req.body.FormaDePago;
//     let CompraRecibido = JSON.stringify(FechaRecibido);
//     let PrecioTotalRecibido = PrecioTotal();


//     function PrecioTotal() {
//         sequelize.query(`select CantidadProduct * Precio From Pedidos_Productos where Compra = 0`
//         ).then(function (resultados) {
//             let item = Array.from(resultados[0]);
    
//             let i = 0;
//             let suma = 0;
//             let num;
    
//             while (i <= item.length) {
//                 num = parseInt(Object.values(item[i]));
//                 suma = suma + parseInt(num);
//                 console.log("Monto total a pagar " + suma)
//                 i++
//             }
//             // return resultados;
//         }) 
//     }

//     sequelize.query(`select id From Cliente where Usuario = :Usuario`,
//         { replacements: { Usuario: `${res.locals.validUser}` } }
//     ).then(function (resultados) {
//         let Cliente_idRecibido = resultados[0];
//         if (Cliente_idRecibido[0].id < 1) {
//             res.status(500)
//             res.json("Error interno, intenta más tarde");
//         } else {
//             sequelize.query(`select id From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
//             ).then(function (resultados) {

//                 if (Object.keys(resultados[0].length === 0)) {
//                     // let PrecioTotalRecibido = parseInt(PrecioTotal());
//                     console.log("Compra total + " + PrecioTotalRecibido);

//                     console.log("Felicidades es tu primera compra");
//                     sequelize.query("INSERT INTO Pedidos (Fecha, PrecioTotal, Estados_id, FormaDePago, Cliente_id) VALUES (?, ?, ?, ?, ?)",
//                         { replacements: [`${FechaRecibido}`, PrecioTotalRecibido, 1, FormaDePagoRecibido, Cliente_idRecibido[0].id] }
//                     ).then((resultados) => {

//                         res.json(resultados)
//                         sequelize.query(`Update Pedidos_Productos set Compra = ${CompraRecibido} where Compra = 0`,
//                         ).then(() => {
//                             res.json("Tu compra fue realizada exitosamente")
//                         });

//                     });

//                 } else {
//                     console.log("AQUI 5")
//                     console.log("Nos alegra que compraras otra vez");
//                 }
//             })
//         }
//     });
// });



// server.post('/pedidos/', validarUsuarioCliente, (req, res) => {
//     let FechaRecibido = moment();

//     let FormaDePagoRecibido = req.body.FormaDePago;
//     let CompraRecibido = JSON.stringify(FechaRecibido);
//     // let PrecioTotalRecibido = PrecioTotal();


//     function PrecioTotal() {

//         let montoCompleto = sequelize.query(`select CantidadProduct * Precio From Pedidos_Productos where Compra = 0`
//         ).then(function (resultados) {
//             let item = Array.from(resultados[0]);

//             let i = 0;
//             let suma = 0;
//             let num;

//             while (i < item.length) {
//                 num = parseInt(Object.values(item[i]));
//                 suma = suma + parseInt(num);
//                 console.log("Monto total a pagar " + suma)
//                 i++
//             }

//         }).then(function (result) {
//             return montoCompleto
//         }).then(function(r)  {
//             console.log("DENTRO DE LA FUNCION")
//             console.log(r)
//         })
//     }

//     sequelize.query(`select id From Cliente where Usuario = :Usuario`,
//         { replacements: { Usuario: `${res.locals.validUser}` } }
//     ).then(function (resultados) {
//         let Cliente_idRecibido = resultados[0];
//         if (Cliente_idRecibido[0].id < 1) {
//             res.status(500)
//             res.json("Error interno, intenta más tarde");
//         } else {
//             sequelize.query(`select id From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
//             ).then(function (resultados) {

//                 if (Object.keys(resultados[0].length === 0)) {
//                     console.log("CIFRA 2 + " + PrecioTotal());
//                     let PrecioTotalRecibido;
//                     PrecioTotalRecibido = PrecioTotal();
//                     console.log("Compra total + " + PrecioTotalRecibido);

//                     console.log("Felicidades es tu primera compra");
//                     sequelize.query("INSERT INTO Pedidos (Fecha, PrecioTotal, Estados_id, FormaDePago, Cliente_id) VALUES (?, ?, ?, ?, ?)",
//                         { replacements: [`${FechaRecibido}`, PrecioTotalRecibido, 1, FormaDePagoRecibido, Cliente_idRecibido[0].id] }
//                     ).then((resultados) => {

//                         res.json(resultados)
//                         sequelize.query(`Update Pedidos_Productos set Compra = ${CompraRecibido} where Compra = 0`,
//                         ).then(() => {
//                             res.json("Tu compra fue realizada exitosamente")
//                         });

//                     });

//                 } else {
//                     console.log("AQUI 5")
//                     console.log("Nos alegra que compraras otra vez");
//                 }
//             })
//         }
//     });
// });





















server.post('/pedidos/', validarUsuarioCliente, (req, res) => {
    let FechaRecibido = moment();

    let FormaDePagoRecibido = req.body.FormaDePago;
    let CompraRecibido = JSON.stringify(FechaRecibido);
    // let PrecioTotalRecibido = PrecioTotal();













    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`select id From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
            ).then(function (resultados) {

                if (Object.keys(resultados[0].length === 0)) {


                    sequelize.query(`select CantidadProduct * Precio From Pedidos_Productos where Compra = 0`
                    ).then( (resultados) => {
                 
                        let item = Array.from(resultados[0]);
                    
                        let i = 0;
                        let suma = 0;
                        let num;
                    
                        while (i < item.length) {
                            num = parseInt(Object.values(item[i]));
                            suma = suma + parseInt(num);
                            console.log("Monto total a pagar " + suma)
                            i++
                        }
 
                        if(suma > 0) {
                            console.log("CIFRA 2 + " + suma);
                            let PrecioTotalRecibido = suma;

                            console.log("Compra total + " + PrecioTotalRecibido);
        
                            console.log("Felicidades es tu primera compra");
                            sequelize.query("INSERT INTO Pedidos (Fecha, PrecioTotal, Estados_id, FormaDePago, Cliente_id) VALUES (?, ?, ?, ?, ?)",
                                { replacements: [`${FechaRecibido}`, PrecioTotalRecibido, 1, FormaDePagoRecibido, Cliente_idRecibido[0].id] }
                            ).then((resultados) => {
        
                                // res.json(resultados)
                                sequelize.query(`Update Pedidos_Productos set Compra = ${CompraRecibido} where Compra = 0`,
                                ).then((resultado) => {
                                    // console.log(resultado);
                                    res.status(200);
                                    res.json("Tu compra fue realizada exitosamente")
                                });
        
                            });
                        } else {
                            console.log("No tienes items agregados al carrito")
                            res.json("No tienes items agregados al carrito")
                        }
                    })











                    

                } else {
                    console.log("AQUI 5")
                    console.log("Nos alegra que compraras otra vez");
                }
            })
        }
    });
});


















//////////////////////////// RUTA PEDIDOS:ID (PERFECTA, REVISADA)
server.get('/pedidos/:id', validarUsuarioCliente, (req, res) => {
    let idRecibido = req.params.id;


    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido[0].id);
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`select * From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id} and id = ${idRecibido}`
            ).then(function (resultados) {
                console.log(resultados[0])
                let pedid = resultados[0];
                console.log(pedid[0])
        
                if (Object.keys(pedid).length === 0) {
                    res.status(404);
                    res.json({ error: "La compra no está disponible" })
                } else {
                    res.status(200);
                    res.json(resultados);
                }
            });
        }
    }); 
});






// ----------------------------- CARRITO -----------------------------------

// Math.max() AGREGAR ESTA FUNCION AL CARRITO
// REVISAR EL CARRITO - CLIENTE (PERFECTA, REVISADA)
server.get('/carrito/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido[0].id);
        if (resultados < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            console.log("LEER JUSTO AQUI")
            sequelize.query(`SELECT * from Pedidos_Productos where Cliente_id = ${Cliente_idRecibido[0].id}`,
                { type: sequelize.QueryTypes.SELECT }
            ).then(function (resultados) {
                console.log(resultados)
                if (resultados < 1) {
                    res.status(404);
                    res.json({ Error: "El carrito está vacío" });
                } else {
                    res.status(200);
                    res.json(resultados)
                }
            });
        }
    }); 


});


 
// AGREGAR PRODUCTOS AL CARRITO - CLIENTE (PERFECTA, REVISADA)

server.post('/carrito/', validarUsuarioCliente, (req, res) => {
    let CantidadProductRecibido = req.body.CantidadProduct;
    let PrecioRecibido;
    let Productos_idProductosRecibido = req.body.Productos_idProductos;

    sequelize.query(`select Precio From Productos where idProductos = ${Productos_idProductosRecibido}`
    ).then(function (resultados) {
        console.log(resultados[0])
        PrecioRecibido = resultados[0];

        sequelize.query(`select id From Cliente where Usuario = :Usuario`,
            { replacements: { Usuario: `${res.locals.validUser}` } }
        ).then(function (resultados) {
            let Cliente_idRecibido = resultados[0];
            let Cliente_id = Cliente_idRecibido[0].id;

            sequelize.query(`select Productos_idProductos From Pedidos_Productos where Cliente_id = :Cliente_id  and Compra = 0 and Productos_idProductos = ${Productos_idProductosRecibido}`,
                { replacements: { Cliente_id: `${Cliente_id}` } }
            ).then(function (resultados) {
                console.log("Leer aqui abajo")
                console.log(typeof resultados)
                console.log(Object.values(resultados[0]) == 0)
                console.log(Object.entries(resultados).length == 0) 

                if (Object.values(resultados[0]) == 0) {
                    sequelize.query(`INSERT INTO Pedidos_Productos (CantidadProduct, Precio,  Productos_idProductos, Cliente_id, Compra) VALUES (?, ?, ?, ${Cliente_id}, 0)`,
                        { replacements: [CantidadProductRecibido, PrecioRecibido[0].Precio, Productos_idProductosRecibido] }
                    ).then((resultados) => {
                        console.log(`Producto agregado con éxito ${resultados}`)
                        res.json('Agregado con éxito');
                    });


                } else {
                    res.status(400)
                    res.json({ error: "Ya este producto fue agregado al carrito" })
                }

            });
        });
    })
});





// MODIFICAR PRODUCTOS DEL CARRITO - CLIENTE (PERFECTA, REVISADA)
server.put('/carrito/', validarUsuarioCliente, (req, res) => {
    let CantidadProductRecibido = req.body.CantidadProduct;
    let Productos_idProductosRecibido = req.body.Productos_idProductos;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido[0].id);
        if (resultados < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`Update Pedidos_Productos set CantidadProduct = ${CantidadProductRecibido} where Productos_idProductos = ${Productos_idProductosRecibido} and Cliente_id = ${Cliente_idRecibido[0].id}`
            ).then(function (resultados) {
                res.status(200)
                res.json("El cambio fue realizado exitosamente.")

            })
        }
    }); 
}); 


// ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO - CLIENTE (PERFECTA, REVISADA)
server.delete('/carrito/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        console.log("MIRAR AQUI");
        console.log(resultados);
        let Cliente_idRecibido = resultados[0];
        console.log("MIRAR SEGUNDO AQUI");
        console.log(Cliente_idRecibido[0].id);
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`DELETE from Pedidos_Productos where Cliente_id = ${Cliente_idRecibido[0].id}`
            ).then(function (resultados) {
                res.json(resultados)
            });
        }
    }); 
});
 
// ELIMINAR CADA PRODUCTO INDIVIDUALMENTE DEL CARRITO - CLIENTE (PERFECTA, REVISADA)
server.delete('/carrito/:id', validarUsuarioCliente, (req, res) => {
    let Productos_idProductosRecibido = req.params.id;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido[0].id);
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`select Productos_idProductos from Pedidos_Productos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${Productos_idProductosRecibido}`
            ).then(function (resultados) {
                let pr = resultados[0];
                console.log(pr)
                console.log("LEE ESTE")
                console.log(pr[0].Productos_idProductos, Productos_idProductosRecibido)
                if(pr[0].Productos_idProductos != Productos_idProductosRecibido){
                    res.status(404)
                    res.json("El producto no está disponible");
                } else {
                    sequelize.query(`DELETE from Pedidos_Productos where Productos_idProductos = ${Productos_idProductosRecibido} and Cliente_id = ${Cliente_idRecibido[0].id}`
                    ).then(function (resultados) {
                        res.status(200);
                        res.json("El producto fue eliminado exitosamente")
                    });
                }
            });
        }
    }); 
});


// ----------------------------- FAVORITOS ----------------------------------- 
// (PERFECTA, REVISADA)
server.get('/favoritos/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {

        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido);
        if (resultados < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`SELECT * from favoritos where Cliente_id = ${Cliente_idRecibido[0].id}`,
                { type: sequelize.QueryTypes.SELECT }
            ).then(function (resultados) {
                if (resultados < 1) {
                    res.status(404);
                    res.json({ Error: "No tienes productos favoritos agregados" });
                } else {
                    res.status(200);
                    res.json(resultados)
                }
            });
        }
    }); 
});

// (PERFECTA, REVISADA)
server.post('/favoritos/', validarUsuarioCliente, (req, res) => {
    let PRecibido = req.body.Productos_idProductos;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {

        console.log(resultados);
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido);

        sequelize.query(`select Productos_idProductos from Favoritos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${PRecibido}`
        ).then(function (resultados) {
            let recibi = resultados[0];
            // console.log(recibi[0]);
            console.log("ESTE ES");
            console.log(Object.keys(recibi))

            if (Object.keys(recibi).length === 0) {
                sequelize.query(`INSERT INTO Favoritos (Productos_idProductos, Cliente_id) VALUES (?, ${Cliente_idRecibido[0].id})`,
                    { replacements: [PRecibido[0]] }
                ).then((resultados) => {
                    console.log(`Producto agregado con éxito ${resultados}`)
                    res.json('Agregado a favoritos con éxito');
                });
            } else {
                res.status(400)
                res.json({ error: "Este producto ya es favorito" })
            }
        });
    }); 
});

// (PERFECTA, REVISADA)
server.delete('/favoritos/', validarUsuarioCliente, (req, res) => {
    let Productos_idProductosRecibido = req.body.Productos_idProductos;
    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        console.log(Cliente_idRecibido);

        sequelize.query(`select Productos_idProductos from Favoritos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${Productos_idProductosRecibido}`
        ).then(function (resultados) {
            let result = resultados[0]
            console.log(resultados)
            console.log("ESTE ES");
            if (Object.keys(result).length === 0) {
                console.log("1");
                res.status(404)
                res.json("Este producto no está como favorito");
            } else {
                console.log("2");
                sequelize.query(`DELETE from Favoritos where Productos_idProductos = ${Productos_idProductosRecibido} and Cliente_id = ${Cliente_idRecibido[0].id}`
                ).then(function (resultados) {
                    console.log(`Producto eliminado con éxito ${resultados}`)
                    res.json('Eliminado de tus favoritos con éxito');
                });
            }
        })
    });
});



// -----------------------------------------------------------------------

server.use((err, req, res, next) => {
    if (!err) {
        next();
    } else {
        console.log('Error, algo salió mal', err);
        res.status(500).send('Error');
    }
});

server.listen(8080, () => console.log('Servidor iniciado, puerto 8080.')); 




// ESTO ME SIRVE PARA TODO EN LO QUE NECESITE SABER EL ID 

// let Productos_idProductosRecibido = req.body.Productos_idProductos;
// sequelize.query(`select id From Cliente where Usuario = :Usuario`,
//     { replacements: { Usuario: `${res.locals.validUser}` } }
// ).then(function (resultados) {
//     let Cliente_idRecibido = resultados[0];
//     console.log(Cliente_idRecibido[0].id);
//     if (Cliente_idRecibido[0].id < 1) {
//         res.status(500)
//         res.json("Error interno, intenta más tarde");
//     } else {
//         // LO QUE QUIERA HACER 
//     }
// }); 




// ESTA REESTRICCION ME ESTA EVITANDO BORRAR EL USUARIO 
// Cannot delete or update a parent row: a foreign key constraint fails (`delilahfv`.`favoritos`, CONSTRAINT `fk_Favoritos_Cliente1` FOREIGN KEY (`Cliente_id`) REFERENCES `Cliente` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION)

// Agregar Estados.id a la tabla Pedidos_Productos 


// PARA VER QUE PRODUCTOS TENGO EN EL CARRITO 
// TENGO QUE MOSTRAR TODOS LOS PEDIDOS PRODUCTOS DEL CLIENTE QUE EL ID DE PEDIDOS PRODUCTOS NO ESTE EN LA TABLA DE PEDIDOS 



// TENGO QUE HACER Un NUMERO DE COMPRA, ESTE ESTARA EN LA TABLA DE PEDIDOS, Y TAMBIEN ESTARA EN LA TABLA PRODUCTO PEDIDOS (PERO AQUI TODOS LOS PRODUCTOS AL MOMENTO DE COMPRAR RECIBEN EL MISMO)


// SOLO ME FALTA RESOLVER 582
// AGREGAR QUE SI EL PRECIO TOTAL NO ES MAYOR DE 0, NO PUEDA COMPRAR 
