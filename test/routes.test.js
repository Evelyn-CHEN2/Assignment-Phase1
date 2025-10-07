const { expect } = require('chai');
const request = require('supertest');
const { ObjectId } = require('mongodb');

const { app, server, initServer } = require('../server/server.js');
const { connectDB, health, closeDB } = require('../server/mongoDB.js');

describe('Server Integration Tests', function() {
    // Connect with DB
    let db;
    let membership;
    let users;
    let notifications;
    let groups;
    let channels;
    let banReports;
    let chatMsgs;
    before(async() => {
        const ctx = await initServer();
        db = ctx.db;

        membership = db.collection('membership');
        users = db.collection('users');
        notifications = db.collection('notifications');
        groups = db.collection('groups');
        channels = db.collection('channels');
        banReports = db.collection('banReports');
        chatMsgs = db.collection('chatMsgs');
      });
    // Close server after tests
    after(async () => {
        await closeDB();
        server.close()
    });

    describe('Basic health check', function() {
        it('should respond with {ok: true} on GET /', async function() {
            const res = await request(app).get('/');
            expect(res.status).to.eq(200);
            expect(res.body).to.deep.eq({ok: true});
        })
    });

    describe('Database connectivity', function() {
        it('should connect to MongoDB and return health OK', async function() {
            const db = await connectDB();
            expect(db).to.be.an('object');

            const status = await health();
            expect(status.ok).to.eq(1);
        });
    });

    // Route: api-login.js
    describe('login route', function() {
        it('should return object on POST', async() => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'Tome', 
                    pwd: 'tom1234'
                })
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('object');

            const user = res.body;
            expect(user).to.have.property('_id').that.is.a('string');
            expect(user).to.have.property('username').that.is.a('string');
            expect(user).to.have.property('email').that.is.a('string');
            expect(user).to.have.property('groups').that.is.an('array');
            expect(user).to.have.property('valid', true);
            expect(user).to.have.property('avatar');
            expect(user.avatar === null || typeof user.avatar === 'string')
                .to.be.true;
        })
    });

    // Route api-register.js
    describe('register route', function() {
        it('should return object on POST', async() => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: 'cab', 
                    email: 'cab@com', 
                    pwd: '1234'
                });
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('object');

            const user = res.body;
            expect(user).to.have.property('_id').that.is.a('string');;
            expect(user).to.have.property('username', 'cab');
            expect(user).to.have.property('email', 'cab@com');
            expect(user).to.have.property('groups');
            expect(user).to.have.property('valid', true);
            expect(user).to.have.property('avatar');
            expect(user).to.have.property('isSuper', false);
            expect(user.groups).to.be.an('array').that.is.empty;
            expect(user.avatar).to.eq(null);

            await users.deleteOne({ username: 'cab'});
        });
    });

    // Route api-fetchallusers
    describe('fetch all users route', function() {
        it('should return array on GET', async() => {
            const res = await request(app).get('/api/fetchallusers');
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');

            res.body.forEach(user => {
                expect(user).to.have.property('_id').that.is.a('string');;
                expect(user).to.have.property('username').that.is.a('string');
                expect(user).to.have.property('email').that.is.a('string');
                expect(user).to.have.property('groups').that.is.an('array');
                expect(user).to.have.property('valid').that.is.a('boolean');
                expect(user).to.have.property('avatar');
                expect(user).to.have.property('isSuper').that.is.a('boolean');
                expect(user.avatar === null || typeof user.avatar === 'string').to.be.true;
            })
        })
    });

    // Route api-fetchuserByID
    describe('fetch user By ID route', function() {
        it('should return object on GET', async() => {
            // Fetch all users first
            const list = await request(app).get('/api/fetchallusers');
            expect(list.status).to.eq(200);
            expect(list.body).to.be.an('array');

            if(list.body.length === 0) {
                this.skip();
            }

            // Use the first user id
            const selectedUser = list.body[0];
            const id = String(selectedUser._id);

            // Test route
            const res = await request(app).get(`/api/fetchuserbyID/${id}`)
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('object');

            const user = res.body;
            expect(String(user._id)).to.eq(id);
            expect(user).to.have.property('username').that.is.a('string');
            expect(user).to.have.property('email').that.is.a('string');
            expect(user).to.have.property('groups').that.is.an('array');
            expect(user).to.have.property('valid', true);
            expect(user).to.have.property('avatar').that.is.a('string');
            expect(user).to.have.property('isSuper').that.is.a('boolean')
        })
    });

    // Route api-updateuserrole
    describe('update user role route', function() {
        it('upserts admin membership', async() => {
            const userId = new ObjectId();
            const groupId = new ObjectId();

            const res = await request(app)
                .put(`/api/updateuser/${userId.toString()}`)
                .send({
                    groupId: groupId.toString(), 
                    newRole: 'admin'
                });

            expect(res.status).to.eq(204);

            const doc = await membership.findOne({ admin: userId});
            expect(doc).to.exist;
            expect(doc.role).to.eq('admin');
            expect(String(doc.admin)).to.eq(userId.toString());
            const groupIds = (doc.groups || []).map(g=> g.toString());
            expect(groupIds).to.include(groupId.toString());

            await membership.deleteOne({ admin: userId})
        });

        it('should and update user.isSuper', async() => {
            const userId = new ObjectId();
            const groupId = new ObjectId();

            await users.insertOne({
                _id: userId,
                username: 'super_user',
                email: 'super@example.com',
                pwd: '1234',
                groups: [],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            const res = await request(app)
                .put(`/api/updateuser/${userId.toString()}`)
                .send({
                    groupId: groupId.toString(), 
                    newRole: 'super'
                });

            expect(res.status).to.eq(204);

            const user = await users.findOne({ _id: userId});
            expect(user).to.exist;
            expect(user.isSuper).to.eq(true);

            await users.deleteOne({ _id: userId});
        })
    });

    // Route api-addgrouptouser
    describe('add group to user route', function() {
        it('should add a group to a user on PUT', async() => {
            const approverId = new ObjectId();
            const groupId = new ObjectId();
            const applierId = new ObjectId();
            const notificationId = new ObjectId();

            await users.insertOne({
                _id: applierId,
                username: 'super_user',
                email: 'super@example.com',
                pwd: '1234',
                groups: [],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            await notifications.insertOne({
                _id: notificationId,
                applier: applierId,
                groupToApply: groupId,
                status: 'pending',
                approvedBy: null,
                timestamp: new Date()
            });

            const res = await request(app)
                .put('/api/addgrouptouser')
                .send({
                    groupId: groupId.toString(),
                    applierId: applierId.toString(),
                    notificationId: notificationId.toString(),
                    approverId: approverId.toString()
                });
            expect(res.status).to.eq(204);

            // Check updated user
            const updatedUser = await users.findOne({ _id: applierId});
            expect(updatedUser).to.exist;
            expect(String(updatedUser.groups)).to.includes(groupId.toString());

            // Check updated notification
            const updatdNotif = await notifications.findOne({ _id: notificationId});
            expect(updatdNotif).to.exist;
            expect(updatdNotif.status).to.eq('approved');
            expect(String(updatdNotif.approvedBy)).to.eq(approverId.toString());

            await users.deleteOne({ _id: applierId});
            await notifications.deleteOne({ _id: notificationId});
        })
    });

    // Route api-removeuserfromgroup
    describe('remove user from group route', function() {
        it('should remove user from a group on DELETE', async() => {
            const userId = new ObjectId();
            const groupId = new ObjectId();

            await users.insertOne({
                _id: userId,
                username: 'test_user',
                email: 'test@example.com',
                pwd: '1234',
                groups: [groupId],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            const res = await request(app)
                .delete('/api/removeuserfromgroup')
                .query({
                    userId: userId.toString(),
                    groupId: groupId.toString()
                });

                expect(res.status).to.eq(204);

                const deleted = await users.findOne({ _id: userId });
                expect(deleted).to.exist;
                const groupIds = (deleted.groups || []).map(g => g.toString());
                expect(groupIds).not.include(groupId.toString());

                await users.deleteOne({_id: userId});
        })
    });

    // Route api-banuserByID
    describe('ban user By ID route', function() {
        it('upserts a ban report', async() => {
            const userId = new ObjectId();
            const channelId = new ObjectId();

            const res = await request(app)
                .post(`/api/banuserbyID/${String(userId)}`)
                .send({channelId: channelId.toString()});

            expect(res.status).to.eq(200);
            
            const doc = await banReports.findOne({ userId: userId });
            expect(doc).to.exist;
            expect(String(doc.userId)).to.eq(userId.toString());
            const channelIds = (doc.channelIds || []).map(c => c.toString());
            expect(channelIds).include(channelId.toString());

            await banReports.deleteOne({ _id: doc._id });
        });
    });

    // Route api-unbanuserbyID
    describe('unban user By ID route', function() {
        it('should unban a user in a channel on PUT', async() => {
            const userId = new ObjectId();
            const channelId = new ObjectId();
            const banReportId = new ObjectId();

            await banReports.insertOne({
                _id: banReportId,
                userId: userId,
                channelIds: [channelId]
            });

            const res = await request(app)
            .put(`/api/unbanuserbyID/${String(userId)}`)
            .send({channelId: channelId.toString()});

            expect(res.status).to.eq(204);
            const updated = await banReports.findOne({ _id: banReportId });
            expect(updated).to.exist;
            const channelIds = (updated.channelIds || []).map(c => c.toString());
            expect(channelIds).to.not.include(channelId.toString());

            await banReports.deleteOne({ _id: banReportId });
        })
    });

    // Route api-fetchmembership
    describe('fetch membership by ID route', function() {
        it('should fetch membership with a id on GET', async() => {
            const userId = new ObjectId();
            const memId = new ObjectId();

            await membership.insertOne({
                _id: memId,
                role: 'admin',
                admin: userId,
                groups: []
            });

            const res = await request(app)
                .get('/api/fetchmembership')
                .query({userId: userId.toString()});

            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('object');

            const doc = res.body;
            expect(doc).to.have.property('role', 'admin');
            expect(doc).to.have.property('admin', userId.toString());
            expect(doc).to.have.property('groups').that.is.an('array');

            await membership.deleteOne({ _id: memId })
        })
    });

    // Route uploadavatar
    describe('upload avatar route', function() {
        it('should upload a avatar for a user on POST', async() => {
            const userId = new ObjectId();

            await users.insertOne({
                _id: userId,
                username: 'avatar_user',
                email: 'avatar@example.com',
                pwd: '1234',
                groups: [],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            const fileBuf = Buffer.from('tiny-avatar-bytes');

            const res = await request(app)
                .post(`/api/uploadavatar/${userId.toString()}/avatar`)
                .attach('avatar', fileBuf, 'avatar.bin');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('avatar').that.is.a('string');

            const url = res.body.avatar;
            expect(url.startsWith('data:')).to.be.true;
            expect(url.includes(';base64,')).to.be.true;

            const saved = await users.findOne({ _id: userId });
            expect(saved).to.exist;
            expect(saved.avatar).to.equal(url);

            await users.deleteOne({ _id: userId });
        })
    });

    // Route api-fetchallgroups
    describe('fetch all groups route', function() {
        it('should return array on GET', async() => {
            const res = await request(app).get('/api/allgroups');
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');

            res.body.forEach(group => {
                expect(group).to.have.property('_id').that.is.a('string');;
                expect(group).to.have.property('groupname').that.is.a('string');
                expect(group).to.have.property('description').that.is.a('string');
                expect(group).to.have.property('channels').that.is.an('array');
                expect(group).to.have.property('createdBy').that.is.a('string');
            })
        });
    });

    // Route api-creategroup
    describe('create a group route', function() {
        it('should create a group, channels, update user and membership on POST', async() => {
            const userId = new ObjectId();

            await users.insertOne({
                _id: userId,
                username: 'creator',
                email: 'creator@example.com',
                pwd: '1234',
                groups: [],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            await membership.insertOne({
                role: 'admin',
                admin: userId,
                groups: [], 
            });

            const res = await request(app)
                .post('/api/creategroup')
                .send({
                    groupname: 'test_group',
                    description: 'test_description',
                    channelNames: ['c1', 'c2'],
                    userId: userId.toString()
                });
            
            expect(res.status).to.eq(200);

            const groupDoc = await groups.findOne({ groupname: 'test_group' });
            expect(groupDoc).to.exist;
            expect(groupDoc.description).to.eq('test_description');
            expect(String(groupDoc.createdBy)).to.eq(userId.toString());
            expect(groupDoc.channels).to.be.an('array').with.lengthOf(2);

            const channelDocs = await channels
                .find({ _id: { $in: groupDoc.channels } })
                .toArray();
            expect(channelDocs).to.exist;
            expect(channelDocs).to.have.lengthOf(2);
            const chanNames = channelDocs.map(c=>c.channelname);
            expect(chanNames).to.have.members(['c1', 'c2']);
            channelDocs.forEach(c => {
                expect(String(c.groupId)).to.eq(groupDoc._id.toString());
                expect(c.chatMsg).to.be.an('array');
            });

            const userDoc = await users.findOne({ _id: userId });
            const userGroups = (userDoc.groups || []).map(g => g.toString());
            expect(userGroups).to.include(groupDoc._id.toString());

            const memDoc = await membership.findOne({ admin: userId });
            expect(memDoc).to.exist;
            const memGroups = (memDoc.groups || []).map(m => m.toString());
            expect(memGroups).to.include(String(groupDoc._id));

            await users.deleteOne({ _id: userId });
            await groups.deleteOne({ _id: groupDoc._id });
            await channels.deleteMany({ _id: {$in: groupDoc.channels}});
            await membership.deleteOne({ admin: userId })
        })
    });

    // Route api-editgroup
    describe('edit a group name route', function() {
        it('should edit name for a group on PUT', async() => {
            const groupId = new ObjectId();
            await groups.insertOne({
                _id: groupId,
                groupname: 'test_group',
                description: 'test_description',
                channels: [],
                createdBy: new ObjectId()
            });

            const res = await request(app)
                .put(`/api/editgroup/${groupId.toString()}`)
                .send({ newGroupName: 'new test name'});
            
            expect(res.status).to.eq(204);

            const updated = await groups.findOne({ _id: groupId });
            expect(updated.groupname).to.eq('new test name');

            await groups.deleteOne({ _id: groupId });
        })
    });

    // Route api-deletegroup
    describe('delete a group route', function() {
        it('should delete a group By ID on DELETE, detele channels, update user and membership', async() => {
            const groupId = new ObjectId();
            const userId = new ObjectId();
            const memId = new ObjectId();

            await groups.insertOne({
                _id: groupId,
                groupname: '',
                description: '',
                channels: [],
                createdBy: new ObjectId()
            });

            await users.insertOne({
                _id: userId,
                username: 'creator',
                email: 'creator@example.com',
                pwd: '1234',
                groups: [groupId],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            await membership.insertOne({
                _id: memId,
                role: 'admin',
                admin: userId,
                groups: [groupId], 
            });

            await channels.insertOne({
                channelname: '',
                chatMsg: [],
                groupId: groupId
            })

            const res = await request(app).delete(`/api/deletegroup/${groupId.toString()}`);
            expect(res.status).to.eq(204);

            const deletedGroup = await groups.findOne({ _id: groupId });
            expect(deletedGroup).not.be.exist;

            const updatedUser = await users.findOne({ _id: userId });
            const userGroups = (updatedUser.groups || []).map(g => g.toString())
            expect(userGroups).not.include(groupId.toString());

            const deletedChan = await channels.findOne({ groupId: groupId});
            expect(deletedChan).not.be.exist;

            const updatedMem = await membership.findOne({ _id: memId });
            const memGroups = (updatedMem.groups || []).map(g => g.toString());
            expect(memGroups).not.include(groupId.toString());

            await groups.deleteOne({ _id: groupId });
            await membership.deleteOne({ _id: memId});
        })
    });

    // Route api-leavegroup
    describe('leave a group route', function() {
        it('should delete groupId from user groups after leaving on DELETE', async() => {
            const userId = new ObjectId();
            const groupId = new ObjectId();

            await users.insertOne({
                _id: userId,
                username: 'creator',
                email: 'creator@example.com',
                pwd: '1234',
                groups: [groupId],
                valid: true,
                avatar: null,
                isSuper: false,
            });

            const res = await request(app)
                .delete('/api/leavegroup')
                .query({ 
                    userId: userId.toString(), 
                    groupId: groupId.toString() 
                });
            
            expect(res.status).to.eq(204);

            const updated = await users.findOne({ _id: userId });
            const groupIds = (updated.groups || []).map(g => g.toString());
            expect(groupIds).not.include(groupId.toString());

            await users.deleteOne({ _id: userId });
        })
    });

    // Route fetchallchannels
    describe('fetch all channels route', function() {
        it('should return array on GET', async() => {
            const res = await request(app).get('/api/allchannels');
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');

            res.body.forEach(channel => {
                expect(channel).to.have.property('_id').that.is.a('string');;
                expect(channel).to.have.property('channelname').that.is.a('string');
                expect(channel).to.have.property('groupId').that.is.a('string');
                expect(channel).to.have.property('chatMsg').that.is.an('array');
            })
        })
    });

    // Route createchannel
    describe('create channel route', function() {
        it('should return object on POST', async() => {
            const groupId = new ObjectId();

            await groups.insertOne({
                _id: groupId,
                groupname: 'test_group',
                description: 'test_description',
                channels: [],
                createdBy: new ObjectId()
            });

            const res = await request(app)
                .post('/api/createchannel')
                .send({
                    channelName: 'test_name', 
                    groupId: groupId.toString()
                });
                
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('object');

            const updated = await groups.findOne({ _id: groupId });
            const channelIds = (updated.channels || []).map(c => c.toString());
            expect(channelIds).to.include(res.body._id);

            const channel = res.body;
            expect(channel).to.have.property('_id').that.is.a('string');;
            expect(channel).to.have.property('channelname', 'test_name');
            expect(String(channel.groupId)).to.eq(groupId.toString());
            expect(channel.chatMsg).to.be.an('array').that.is.empty;

            await groups.deleteOne({ _id: groupId });
            await channels.deleteOne({ channelname: 'test_name'});
        });
    });

    // Route api-deletechannel
    describe('delete a channel route', function() {
        it('should delete a channel By ID on DELETE, and update group', async() => {
            const groupId = new ObjectId();
            const chanId = new ObjectId();

            await groups.insertOne({
                _id: groupId,
                groupname: '',
                description: '',
                channels: [chanId],
            });

            await channels.insertOne({
                _id: chanId,
                channelname: '',
                chatMsg: [],
                groupId: groupId
            })

            const res = await request(app).delete(`/api/deletechannel/${chanId.toString()}`);
            expect(res.status).to.eq(204);

            const updatedGroup = await groups.findOne({ _id: groupId });
            const groupChans = (updatedGroup.channels || []).map(c => c.toString());
            expect(groupChans).not.include(chanId);

            const deletedChan = await channels.findOne({ _id: chanId});
            expect(deletedChan).not.be.exist;

            await groups.deleteOne({ _id: groupId });
            await channels.deleteOne({ _id: chanId });
        })
    });

    // Route api-fetchchatmessages
    describe('fetch chat messages route', function () {
        it('returns messages for a channel, sorted ascending by timestamp', async () => {
            const channelId = new ObjectId();
    
            await chatMsgs.insertMany([
            {
                channelId,
                sender: new ObjectId(),
                message: 'hello',
                timestamp: new Date('2024-01-01T00:00:03Z'),
            },
            {
                channelId,
                sender: new ObjectId(),
                message: 'hi',
                timestamp: new Date('2024-01-01T00:00:01Z'),
            },
            {
                channelId,
                sender: new ObjectId(),
                message: 'morning',
                timestamp: new Date('2024-01-01T00:00:02Z'),
            },
            ]);
        
            const res = await request(app).get(`/api/fetchchatmessages/${channelId.toString()}`);
        
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(3);
        
            // check sorted ascending by timestamp
            const times = res.body.map(m => new Date(m.timestamp).getTime());
            const sorted = [...times].sort((a, b) => a - b);
            expect(times).to.deep.equal(sorted);
        
            // all belong to the requested channel
            const msgChannelIds = res.body.map(m => String(m.channelId) );
            msgChannelIds.forEach(id => expect(id).to.eq(channelId.toString()));
        
            await chatMsgs.deleteMany({ channelId });
        });
    });

    // Route api-createnotification
    describe('create notification route', function() {
        it('should return object on POST', async() => {
            const userId  = new ObjectId();
            const groupId = new ObjectId();

            const res = await request(app)
                .post('/api/createnotification')
                .send({
                    userId:  userId.toString(),  
                    groupId: groupId.toString()
                });
            expect(res.status).to.eq(204);

            const notif = await notifications.findOne({applier: userId, groupToApply: groupId})
            expect(notif).to.exist;
            expect(notif.status).to.eq('pending');
            expect(notif.approvedBy).to.eq(null);
            expect(notif.timestamp instanceof Date).to.equal(true);

            await notifications.deleteOne({ _id: notif._id});
        });
    });

    // Route api-fetchnotifications
    describe('fetch all notifications route', function() {
        it('should return array on GET', async() => {
            const res = await request(app).get('/api/fetchnotifications');
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');

            res.body.forEach(notif => {
                expect(notif).to.have.property('_id').that.is.a('string');;
                expect(notif).to.have.property('applier').that.is.a('string');
                expect(notif).to.have.property('groupToApply').that.is.a('string');
                expect(notif).to.have.property('status').that.is.a('string');
                expect(notif).to.have.property('approvedBy').that.is.a('string');
                expect(new Date(notif.timestamp).toString()).not.to.eq('invalid date');
            });
        });
    });

    // Route api-deletenotification
    describe('delete a notification route', function() {
        it('should delete a notification By ID on DELETE', async() => {
            const notifId = new ObjectId();
            await notifications.insertOne({
                _id: notifId,
                applier: new ObjectId(),
                groupToApply: new ObjectId(),
                status: 'approved',
                approvedBy: new ObjectId(),
                timestamp: new Date()
            });

            const res = await request(app).delete(`/api/deletenotification/${notifId}`);

            expect(res.status).to.eq(204);

            const deleted = await notifications.findOne({ _id: notifId });
            expect(deleted).to.not.exist;
        });
    });

    // Route api-fetchallreports
    describe('fetch all reports route', function() {
        it('should fetch all reports on GET', async() => {
            const res = await request(app).get('/api/fetchallreports');
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');

            res.body.forEach(report => {
                expect(report).to.have.property('_id').that.is.a('string');;
                expect(report).to.have.property('userId').that.is.a('string');
                expect(report).to.have.property('channelIds').that.is.an('array');
            })
        })
    })
})