const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const cors = require('cors');  
app.use(cors());
app.use(express.json());

require('./routes').route(app);
require('./listen').start(app, PORT);