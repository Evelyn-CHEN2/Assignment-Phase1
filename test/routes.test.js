const { expect } = require('chai');
const request = require('supertest');
const { ObjectId } = require('mongodb');

const { app, server } = require('../server/server.js');
const { connectDB, health } = require('../server/mongoDB.js');
const { timestamp } = require('rxjs');

describe('Server Integration Tests', function() {
    // Connect with DB

    let db;
    let membership;
    let users;
    let notifications;
    before(async() => {
        db = await connectDB();
        membership = db.collection('membership');
        users = db.collection('users');
        notifications = db.collection('notifications')
      });
    // Close server after tests
    after(function(done) {
        server.close(done)
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
                .send({username: 'Tome', pwd: 'tom1234'})
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
                .send({username: 'cab', email: 'cab@com', pwd: '1234'});
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
    describe('fetchallusers route', function() {
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
    describe('fetchuserByID route', function() {
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
    describe('updateuserrole route', function() {
        it('should upsert admin membership with group', async() => {
            const userId = new ObjectId();
            const groupId = new ObjectId();

            const res = await request(app)
                .put(`/api/updateuser/${userId.toString()}`)
                .send({groupId: groupId.toString(), newRole: 'admin'});

            expect(res.status).to.eq(204);

            const doc = await membership.findOne({ admin: userId});
            expect(doc).to.exist;
            expect(doc.role).to.eq('admin')
            const groupIds = (doc.groups || []).map(String);
            expect(groupIds).to.include(groupId.toString());

            await membership.deleteMany({ role: 'admin', admin: userId})
        });

        it('should createa a super document, and update user', async() => {
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
                .send({groupId: groupId.toString(), newRole: 'super'});

            expect(res.status).to.eq(204);

            const updated = await membership.findOne({role: 'super', admin: userId})
            expect(updated).to.exist;
            expect(updated.role).to.eq('super');
            expect(String(updated.admin)).to.eq(userId.toString());

            const user = await users.findOne({ _id: userId});
            expect(user).to.exist;
            expect(user.isSuper).to.eq(true);

            await users.deleteOne({ _id: userId});
            await membership.deleteMany({ role: 'super', admin: userId})
        })
    });

    // Route api-addgrouptouser
    describe('addgrouptouser route', function() {
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
    })
})