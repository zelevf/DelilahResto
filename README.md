Delilah Restó

Proyecto realizado como parte de la carrera de Desarrollo Web Full Stack de Acámica.

El proyecto está basado en la creación de un sistema de pedidos para Delilah Restó. Estableciendo una REST API completamente funcional, que permite realizar operaciones CRUD sobre una estructura de datos; consumible por administradores y clientes (según sea el caso). 

Fue utilizado Node.JS, Express y MySQL para su producción.


------------------------------------------------------------
GUÍA PARA UTILIZAR ESTE REPOSITORIO.

Hola, esta es una guía para utilizar los archivos del proyecto Delilah Restó.
Debes tener instalado Node.js, MySQL y Postman.


Descarga de archivos:

Aquí encontrarás un archivo JS donde está todo el proyecto, el archivo package.json, el archivo package-lock.json y una carpeta llamada Archivos de ayuda.

En la carpeta Archivos de ayuda, encontrarás: 
- El archivo YAML con toda la información de la API.
- El archivo SQL con la estructura de base de datos.
- Un archivo txt con la estructura de la base de datos.
- Un archivo llamado Para cargar en la BD, con información para cargar Usuarios (Administradores o Clientes), Estados de los Pedidos y 6 distintos platillos de prueba para el restó. 

La información de Estados de los pedidos es obligatoria para el correcto uso de la aplicación, lo demás puede ser opcional.



Instalación:

Ahora que contamos con todos los archivos necesarios, es hora de la instalación.

Activa el servidor de la base de datos, en mi caso utilizo XAMPP y la manejo desde el navegador con PHPMyAdmin. La base de datos está configurada para escuchar por el puerto 3306.

Primero crearemos la base de datos. Para esto podemos hacerlo de dos formas, así que puedes escoger la que más te gusta. 

- Primera: Puedes importar el archivo DelilahFV.sql. 

- Segunda: Copiar la información del archivo EstructuraBaseDeDatosDelilahResto.txt y ejecutarlo como una consulta SQL.



Carga de datos:

Ya contamos con nuestra estructura de la base de datos, ahora debemos cargar algunos elementos que nos permitirán hacernos las cosas más fácil. 

IMPORTANTE: Hay datos necesarios para su correcto uso y otros opcionales que nos permitirán adelantar un poco las cosas.

Necesarios:
- Estados de los pedidos.

Opcionales:
- Usuarios Administradores.
- Usuarios Clientes.
- Platillos Delilah Restó.


Uso de la aplicación:

Ya es momento de utilizar nuestra aplicación, es importante recordar que los archivos están preparados para una red de uso local, por lo que el servidor lo iniciaremos desde el editor de código para realizar las pruebas. El servidor está configurado para escuchar desde el puerto 8080.

- Primero abre el archivo server.js.
- Si clonaste correctamente el repositorio no debería ser necesario instalar ningún paquete, por lo que iniciaremos el servidor desde el terminal.
- Abre tu editor de código y Postman para realizar todas las pruebas.
- Desde la terminal de nuestro editor de código deberás ejecutar el comando nodemon server.


Ya está todo listo, ahora puedes realizar todas las consultas que quieras a la API Delilah Resto hecha por mi, espero que te sea de gran ayuda.



Información:
Recuerda que puedes apoyarte en el archivo YAML para saber qué datos debes agregar. Aquí algunos comentarios importantes de algunas rutas o paths:

Ruta: /registro
Método: Post
Esta ruta carga un dato oculto que es el "tipoUsuario", el cual está predeterminado a Cliente identificado como "0". 

Ruta: /registroadministradordr
Método: Post
Esta ruta carga un dato oculto que es el "tipoUsuario", el cual está predeterminado a Administrador identificado como "1".

Ruta: /login
Método: Post
Esta ruta nos devuelve un token que debemos pasarlo a través de headers en todas las rutas que se necesite autenticación con la siguiente estructura: 
Key: Authorization  Value: Bearer tokenRecibido

Ruta: /carrito
Método: Get
Esta ruta devuelve el stock del producto. Si indica 1 hay disponible, si indica 0 no está disponible.


Ruta: /pedidos
Método: Post
En esta ruta hay que indicar la forma de pago del pedido. 1 indica pago con tarjeta, 2 pago con efectivo

Ruta: /usuarios
Método: Get
Esta ruta ofrece un dato que es el "tipoUsuario", el cliente se identifica como "0" y administrador como "1".

Ruta: /productos
Método: Get 
Esta ruta ofrece un dato que es el "stock", cuando el producto está disponible se identifica como "1" y cuando no está disponible como "0".

Ruta: /productos
Método: Post 
Esta ruta requiere un dato que es el "stock", cuando el producto está disponible se identifica como "1" y cuando no está disponible como "0".

Ruta: /productos/{id}
Método: Put 
Esta ruta requiere un dato que es el "stock", cuando el producto está disponible se identifica como "1" y cuando no está disponible como "0".

Ruta: /ordenes
Método: Get 
Esta ruta ofrece el dato "Estados_id", que indica el estado del pedido: 
1 Nuevo
2 Confirmado 
3 Preparando
4 Enviando
5 Cancelado
6 Entregado.

Ruta: /ordenes/
Método: Put 
Esta ruta requiere el dato "Estados_id", que indica el estado del pedido: 
1 Nuevo
2 Confirmado 
3 Preparando
4 Enviando
5 Cancelado
6 Entregado.

Ruta: /ordenes/
Método: Delete 
Esta ruta requiere el dato "id" de Pedidos. Esta opción elimina el pedido de nuestra base de datos, siempre y cuando el pedido haya sido cancelado (5 Cancelado) o entregado (6 Entregado). No se podrá eliminar un pedido mientras esté en proceso (1 Nuevo, 2 Confirmado, 3 Preparando o 4 Enviando).

Ruta: /ordenes/{id}
Método: Delete 
Esta ruta requiere el dato "id" de Pedidos. Esta opción elimina el pedido de nuestra base de datos, siempre y cuando el pedido haya sido cancelado (5 Cancelado) o entregado (6 Entregado). No se podrá eliminar un pedido mientras esté en proceso (1 Nuevo, 2 Confirmado, 3 Preparando o 4 Enviando).
