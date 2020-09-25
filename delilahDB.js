// BASE DE DATOS 
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/Delilah');



// ----------------------------- USUARIOS -----------------------------------
sequelize.query('select * From clientes', 
    {type: sequelize.QueryTypes.SELECT}
).then(function(resultados) {
    console.log(resultados)
});


// Creando una cuenta y agregando un cliente (creo que le faltaria el middleware)
server.post('/clientes', (req, res) => {
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

// ----------------------------- PEDIDOS -----------------------------------






// ----------------------------- PRODUCTOS -----------------------------------


// ----------------------------- CARRITO -----------------------------------


// ----------------------------- ESTADOS DE ÓRDENES -----------------------------------