const express = require('express');
const PORT = 3000;
const cors = require('cors'); 
const connectDB = require('./mongoDB.js');


(async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    try {
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

        const db = await connectDB();
        // Routes to handle user authentication
        require('./routes/api-login.js').route(app, db);
        require('./routes/api-register.js').route(app, db);

        // Routes for users management
        require('./routes/api-fetchallusers.js').route(app, db);
        require('./routes/api-fetchuserByID.js').route(app, db);
        require('./routes/api-updateuserrole.js').route(app, db);
        require('./routes/api-addgrouptouser.js').route(app, db);
        require('./routes/api-removeuserfromgroup.js').route(app, db);
        require('./routes/api-deleteuser.js').route(app, db);
        require('./routes/api-banuserByID.js').route(app, db);
        require('./routes/api-unbanuserByID.js').route(app, db);
        require('./routes/api-fetchmembership.js').route(app, db);

        // Routes for groups management
        require('./routes/api-fetchallgroups.js').route(app, db);
        require('./routes/api-creategroup.js').route(app, db);
        require('./routes/api-editgroup.js').route(app, db);
        require('./routes/api-deletegroup.js').route(app, db);
        require('./routes/api-leavegroup.js').route(app, db);

        // Routes for channels management
        require('./routes/api-fetchallchannels.js').route(app, db);
        require('./routes/api-createchannel.js').route(app, db);
        require('./routes/api-deletechannel.js').route(app, db);

        // Routes for notifications management
        require('./routes/api-createnotification.js').route(app, db);
        require('./routes/api-fetchnotifications.js').route(app, db);
        require('./routes/api-deletenotification.js').route(app, db);
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();


  
