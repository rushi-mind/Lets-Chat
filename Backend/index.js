/* USING MQTT - AEDES LOCAL MQTT SERVER */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const mqtt = require('mqtt');
const ws = require('websocket-stream');
const httpServer = require('http').createServer();
const app = express();
const route = require('./routes');

const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
server.listen(1883);

// to create a server mqtt over websocket on port 8083 
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(8083);

app.use(cors());
app.use(bp.json());
app.use('/', route);

if(!process.env.PORT) {
    console.error('FATAL ERROR: env is not setup');
    process.exit(1);
}

app.listen(process.env.PORT, () => {
    console.log('running...');
});

let onlineUsers = [];

const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'mqttx_' + Math.random().toString(16).slice(3),
});

client.subscribe('user-joined');
client.subscribe('user-left');

client.on('message', (topic, payload) => {
    payload = (JSON.parse(payload));
    switch (topic) {
        case 'user-joined':
            onlineUsers.push(payload);
            client.publish('updated-users-list', JSON.stringify(onlineUsers));
            break;

        case 'user-left':
            for(let i=0; i<onlineUsers.length; i++) if(onlineUsers[i].id == payload.id) onlineUsers.splice(i, 1);
            client.publish('updated-users-list', JSON.stringify(onlineUsers));
            break;
        default:
            break;
    }
});