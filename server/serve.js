const express = require('express');
const app = express();
const PORT = 3000;

const cors = require('cors');  
app.use(cors());
app.use(express.json());

require('./routes/api-login.js').route(app);
require('./routes/api-register.js').route(app);
require('./routes/api-allusers.js').route(app);

require('./listen.js').start(app, PORT);

  
