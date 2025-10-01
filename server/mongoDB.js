const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

let db;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db('chat');
        console.log('Connected to MongoDB');
    }
    return db;
}

async function health() {
    let result = await db.command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return result;
}

async function closeDB() {
    if (client) {
      await client.close();
    }
    db = undefined;
}

module.exports = { connectDB, health, closeDB };
