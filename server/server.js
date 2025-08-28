const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors'); 
app.use(cors());
app.use(express.json());

const server = require('http').createServer(app);
const options = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}
const io = require('socket.io')(server, options);
const sockets = require('./socket.js');
sockets.connect(io, PORT);

server.listen(PORT, () => {
    console.log(`HTTP + Socket.IO listening on http://localhost:${PORT}`);
  });

// Routes to handle user authentication
require('./routes/api-login.js').route(app);
require('./routes/api-register.js').route(app);

// Routes for users management
require('./routes/api-fetchallusers.js').route(app);
require('./routes/api-fetchuserByID.js').route(app);
require('./routes/api-updateuserrole.js').route(app);
require('./routes/api-addgrouptouser.js').route(app);
require('./routes/api-deleteuser.js').route(app);
require('./routes/api-banuserByID.js').route(app);

// Routes for groups management
require('./routes/api-fetchallgroups.js').route(app);
require('./routes/api-creategroup.js').route(app);
// require('./routes/api-editgroup.js').route(app);
require('./routes/api-deletegroup.js').route(app);
require('./routes/api-deletegroupfromuser.js').route(app);

// Routes for channels management
require('./routes/api-fetchallchannels.js').route(app);
require('./routes/api-createchannel.js').route(app);
require('./routes/api-deletechannel.js').route(app);
require('./routes/api-addmessage.js').route(app);

// Routes for notifications management
require('./routes/api-createnotification.js').route(app);
require('./routes/api-fetchnotifications.js').route(app);
require('./routes/api-deletenotification.js').route(app);


// require('./listen.js').start(app, PORT);

  
