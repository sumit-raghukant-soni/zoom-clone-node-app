// api/server.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIO = require('socket.io');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Ensure the views folder is correctly set
app.use(express.static(path.join(__dirname, '../public')));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
