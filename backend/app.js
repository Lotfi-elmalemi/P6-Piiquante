const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
//var mongodbErrorHandler = require('mongoose-mongodb-errors');
const sauceRoutes = require('./routes/sauce.routes');
const userRoutes = require('./routes/auth.routes');
const path = require('path');
//mongoose.plugin(mongodbErrorHandler);

mongoose.connect('mongodb+srv://Lotfi:azerty@cluster0.mhcfgb6.mongodb.net/?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(error));

const app = express()


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app

