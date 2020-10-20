const express = require('express');

const server = express();
 
const bodyParser = require('body-parser');
server.use(bodyParser.json());

const jwt = require('jsonwebtoken');

const moment = require('moment');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/DelilahFV');


// ----------------------------- MIDDLEWARE -----------------------------------

// GENERALES (SIN PARÁMETROS DE MÁS)
function validarRuta(req, res, next) {

    if (Object.keys(req.query).length > 0) {
        res.status(400);
        res.json("Parámetros de más en la ruta");
    } else {
        next();
    }
}
server.use(validarRuta);



// ESPECÍFICOS (TOKEN)

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

// LISTA - ADMINISTRADOR
server.get('/usuarios/', validarUsuarioAdmin, (req, res) => {

    sequelize.query('select * From cliente where tipoUsuario = 0',
        { type: sequelize.QueryTypes.SELECT }
    ).then(function (resultados) {

        if (Object.keys(resultados).length < 1) {
            res.status(404);
            res.json({ Error: "No hay usuarios registrados" });
        } else {
            res.status(200);
            res.json(resultados)
        }
    });

});

// POR SU ID - CLIENTE
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

// ACTUALIZAR - CLIENTE
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


// ELIMINAR USUARIO - CLIENTE
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

// LISTA DE PRODUCTOS - NO NECESITA VALIDACIÓN
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

// AGREGAR PRODUCTOS - ADMINISTRADOR
server.post('/productos/', validarUsuarioAdmin, (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    sequelize.query("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
        { replacements: [nombre, descripcion, precio, stock] }
    ).then((resultados) => {
        res.json('Agregado con éxito');
    });
});

// BORRAR PRODUCTOS - ADMINISTRADOR
server.delete('/productos/', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.body.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function (resultados) {
        res.status(200)
        res.json("Producto eliminado")
    });
});


//////////////////////////// RUTA PRODUCTOS:ID 

// PRODUCTOS POR SU ID - NO NECESITA VALIDACIÓN
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


// ACTUALIZAR PRODUCTOS - ADMINISTRADOR
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

// ELIMINAR PRODUCTOS - ADMINISTRADOR
server.delete('/productos/:id', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query('DELETE from productos where idProductos = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function () {
        res.status(200)
        res.json("Producto eliminado del stock exitosamente")
    });
});




// ----------------------------- ÓRDENES - ADMINISTRADOR -----------------------------------

// TODAS LAS ÓRDENES DE COMPRA - ADMINISTRADOR
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

// ACTUALIZAR EL ESTADO DE UNA ORDEN
server.put('/ordenes/', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.body.id;
    let estadoRecibido = req.body.estado;

    sequelize.query('select Estados_id From Pedidos',
    ).then(function (resultados) {
        let nuevo = resultados[0];
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


// ÓRDENES POR SU ID - ADMINISTRADOR
server.get('/ordenes/:id', validarUsuarioAdmin, (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query('select * From Pedidos where id = :id',
        { replacements: { id: `${idRecibido}` } }
    ).then(function (resultados) {
        let orden = resultados[0];
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

// TODOS LOS PEDIDOS - POR CADA CLIENTE
server.get('/pedidos/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`SELECT * FROM Pedidos where Cliente_id = ${Cliente_idRecibido[0].id}`
            ).then(function (resultados) {
                if (Object.keys(resultados[0]).length === 0) {
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


// REALIZAR UN PEDIDO CON LOS PRODUCTOS DEL CARRITO - CLIENTE
server.post('/pedidos/', validarUsuarioCliente, (req, res) => {
    let FechaRecibido = moment();
    let FormaDePagoRecibido = req.body.FormaDePago;
    let CompraRecibido = JSON.stringify(FechaRecibido);

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
                sequelize.query(`select CantidadProduct * Precio From Pedidos_Productos where Compra = 0`
                ).then((resultados) => {
                    let item = Array.from(resultados[0]);
                    let i = 0;
                    let suma = 0;
                    let num;

                    while (i < item.length) {
                        num = parseInt(Object.values(item[i]));
                        suma = suma + parseInt(num);
                        i++
                    }

                    if (suma > 0) {
                        let PrecioTotalRecibido = suma;

                        sequelize.query("INSERT INTO Pedidos (Fecha, PrecioTotal, Estados_id, FormaDePago, Cliente_id) VALUES (?, ?, ?, ?, ?)",
                            { replacements: [`${FechaRecibido}`, PrecioTotalRecibido, 1, FormaDePagoRecibido, Cliente_idRecibido[0].id] }
                        ).then((resultados) => {

                            sequelize.query(`Update Pedidos_Productos set Compra = ${CompraRecibido} where Compra = 0`,
                            ).then((resultado) => {
                                res.status(200);
                                res.json("Tu compra fue realizada exitosamente")
                            });
                        });
                    } else {
                        res.json("No tienes items agregados al carrito")
                    }
                })
            })
        }
    });
});



// PEDIDOS POR EL ID - CLIENTE
server.get('/pedidos/:id', validarUsuarioCliente, (req, res) => {
    let idRecibido = req.params.id;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {

            sequelize.query(`select * From Pedidos where Cliente_id = ${Cliente_idRecibido[0].id} and id = ${idRecibido}`
            ).then(function (resultados) {
                let pedid = resultados[0];
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


// REVISAR EL CARRITO - CLIENTE
server.get('/carrito/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        if (resultados < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`SELECT * from Pedidos_Productos where Cliente_id = ${Cliente_idRecibido[0].id}`,
                { type: sequelize.QueryTypes.SELECT }
            ).then(function (resultados) {
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



// AGREGAR PRODUCTOS AL CARRITO - CLIENTE
server.post('/carrito/', validarUsuarioCliente, (req, res) => {
    let CantidadProductRecibido = req.body.CantidadProduct;
    let PrecioRecibido;
    let Productos_idProductosRecibido = req.body.Productos_idProductos;

    sequelize.query(`select Precio From Productos where idProductos = ${Productos_idProductosRecibido}`
    ).then(function (resultados) {
        PrecioRecibido = resultados[0];

        sequelize.query(`select id From Cliente where Usuario = :Usuario`,
            { replacements: { Usuario: `${res.locals.validUser}` } }
        ).then(function (resultados) {
            let Cliente_idRecibido = resultados[0];
            let Cliente_id = Cliente_idRecibido[0].id;

            sequelize.query(`select Productos_idProductos From Pedidos_Productos where Cliente_id = :Cliente_id  and Compra = 0 and Productos_idProductos = ${Productos_idProductosRecibido}`,
                { replacements: { Cliente_id: `${Cliente_id}` } }
            ).then(function (resultados) {
                if (Object.values(resultados[0]) == 0) {

                    sequelize.query(`INSERT INTO Pedidos_Productos (CantidadProduct, Precio,  Productos_idProductos, Cliente_id, Compra) VALUES (?, ?, ?, ${Cliente_id}, 0)`,
                        { replacements: [CantidadProductRecibido, PrecioRecibido[0].Precio, Productos_idProductosRecibido] }
                    ).then((resultados) => {
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



// MODIFICAR CANTIDAD DE PRODUCTOS DEL CARRITO - CLIENTE
server.put('/carrito/', validarUsuarioCliente, (req, res) => {
    let CantidadProductRecibido = req.body.CantidadProduct;
    let Productos_idProductosRecibido = req.body.Productos_idProductos;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
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


// ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO - CLIENTE 
server.delete('/carrito/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
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


// ELIMINAR CADA PRODUCTO INDIVIDUALMENTE DEL CARRITO - CLIENTE
server.delete('/carrito/:id', validarUsuarioCliente, (req, res) => {
    let Productos_idProductosRecibido = req.params.id;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
        if (Cliente_idRecibido[0].id < 1) {
            res.status(500)
            res.json("Error interno, intenta más tarde");
        } else {
            sequelize.query(`select Productos_idProductos from Pedidos_Productos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${Productos_idProductosRecibido}`
            ).then(function (resultados) {
                let pr = resultados[0];
                if (pr[0].Productos_idProductos != Productos_idProductosRecibido) {
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
// VER LOS FAVORITOS - CLIENTE
server.get('/favoritos/', validarUsuarioCliente, (req, res) => {

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];
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

// AGREGAR UN PRODUCTO A FAVORITOS
server.post('/favoritos/', validarUsuarioCliente, (req, res) => {
    let PRecibido = req.body.Productos_idProductos;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];

        sequelize.query(`select Productos_idProductos from Favoritos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${PRecibido}`
        ).then(function (resultados) {
            let recibi = resultados[0];
            if (Object.keys(recibi).length === 0) {
                sequelize.query(`INSERT INTO Favoritos (Productos_idProductos, Cliente_id) VALUES (?, ${Cliente_idRecibido[0].id})`,
                    { replacements: [PRecibido[0]] }
                ).then((resultados) => {
                    res.json('Agregado a favoritos con éxito');
                });
            } else {
                res.status(400)
                res.json({ error: "Este producto ya es favorito" })
            }
        });
    });
});

// ELIMINAR UN PRODUCTO DE FAVORITOS
server.delete('/favoritos/', validarUsuarioCliente, (req, res) => {
    let Productos_idProductosRecibido = req.body.Productos_idProductos;

    sequelize.query(`select id From Cliente where Usuario = :Usuario`,
        { replacements: { Usuario: `${res.locals.validUser}` } }
    ).then(function (resultados) {
        let Cliente_idRecibido = resultados[0];

        sequelize.query(`select Productos_idProductos from Favoritos where Cliente_id = ${Cliente_idRecibido[0].id} and Productos_idProductos = ${Productos_idProductosRecibido}`
        ).then(function (resultados) {
            let result = resultados[0]
            if (Object.keys(result).length === 0) {
                res.status(404)
                res.json("Este producto no está como favorito");
            } else {
                sequelize.query(`DELETE from Favoritos where Productos_idProductos = ${Productos_idProductosRecibido} and Cliente_id = ${Cliente_idRecibido[0].id}`
                ).then(function (resultados) {
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

