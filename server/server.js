const express = require('express');
const app = express();
const PORT = 3000;

const cors = require('cors');  
app.use(cors());
app.use(express.json());

require('./routes/api-login.js').route(app);
require('./routes/api-register.js').route(app);
require('./routes/api-fetchusers.js').route(app);
require('./routes/api-fetchuserByID.js').route(app);
require('./routes/api-updateuserrole.js').route(app);
require('./routes/api-deleteuser.js').route(app);
require('./routes/api-fetchallgroups.js').route(app);
require('./routes/api-creategroup.js').route(app);
require('./routes/api-addgrouptouser.js').route(app);
require('./routes/api-deletegroupfromuser.js').route(app);
// require('./routes/api-editgroup.js').route(app);
require('./routes/api-deletegroup.js').route(app);
require('./routes/api-fetchallchannels.js').route(app);
require('./routes/api-createchannel.js').route(app);
require('./routes/api-deletechannel.js').route(app);
require('./routes/api-addmessage.js').route(app);
require('./routes/api-createnotification.js').route(app);
require('./routes/api-fetchnotifications.js').route(app);
require('./routes/api-deletenotification.js').route(app);


require('./listen.js').start(app, PORT);

  
