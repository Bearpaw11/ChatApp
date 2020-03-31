const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app= express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const adminName ='ChatApp admin'

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);  

        //welcomes user
        socket.emit('message', formatMessage(adminName, 'Welcome to ChatApp'));
    
        //when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(adminName, `${user.username} has joined the chat`));

        // send user and roo info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });
   
    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //when user disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
         if(user) {
        io.to(user.room).emit('message', formatMessage(adminName,`${user.username} has left the chat`));
    

         io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));