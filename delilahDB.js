// BASE DE DATOS 
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/Delilah');




// ----------------------------- CLIENTE -----------------------------------

// MOSTRAR TODOS LOS CLIENTES
function clientesDB() {
    sequelize.query('select * From cliente',
        { type: sequelize.QueryTypes.SELECT }
    ).then(function (resultados) {
        res.json(resultados)
    });
}

function agregarUsuariosDB() {

}

// // ----------------------------- PRODUCTOS -----------------------------------

// MOSTRAR TODOS LOS PRODUCTOS
function productosDB() {
    sequelize.query('select * From Productos',
        { type: sequelize.QueryTypes.SELECT }
    ).then(function (resultados) {
        res.json(resultados)
    });
}

// AGREGAR UN PRODUCTO
function agregarProductosDB() {

}


// ----------------------------- PEDIDOS -----------------------------------


// ----------------------------- CARRITO -----------------------------------


// ----------------------------- ESTADOS DE ÓRDENES -----------------------------------


module.exports = { };
