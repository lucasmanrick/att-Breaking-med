const express = require("express");
const router = require('./src/routes/routesapp')
const expressLayouts = require('express-ejs-layouts');
require("dotenv-safe").config();


const app = express();
const port= 5000;

// BodyParser
const bodyParser = require('body-parser');

// Configurar o BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressLayouts);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');


app.set('views', './src/views');

app.use(express.json());

app.use(express.static(`${__dirname}/public`))

app.use('/', router);

// INICIA O SERVIDOR NA PORTA INFORMADA
app.listen(port, () => {
    console.log(`Servidor respondendo na porta ${port}`);
});