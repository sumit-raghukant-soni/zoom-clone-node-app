// import express from "express";

// const app = express();
// const port = 9000;

// app.use("/", (req, res) => {
//     res.json({ message : "Server is working" });
// })

// app.listen(port, () => {
//     console.log(`Starting server on Port ${port}`);
// });


const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.json({ message : "Server is working" });
    // res.redirect(`/${ uuidv4() }`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // console.log('joined room');
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        // socket.broadcast.emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})

server.listen(3030);