// BASE DE DATOS 
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/Delilah');

module.exports = sequelize;


// ----------------------------- CLIENTE -----------------------------------
// sequelize.query('select * From cliente', 
//     {type: sequelize.QueryTypes.SELECT}
// ).then(function(resultados) {
//     console.log(resultados)
// });




// // ----------------------------- PRODUCTOS -----------------------------------
// sequelize.query('select * From Productos', 
//     {type: sequelize.QueryTypes.SELECT}
// ).then(function(resultados) {
//     console.log(resultados)
// });






// ----------------------------- PRODUCTOS -----------------------------------


// ----------------------------- CARRITO -----------------------------------


// ----------------------------- ESTADOS DE ÓRDENES -----------------------------------



