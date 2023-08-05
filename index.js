import express from 'express';
import http from 'http';
import { initSocketIO } from './socketio/socketManager.js';

const app = express();
export const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('Hello world !');
});


initSocketIO(server)
