import { Server } from 'socket.io';
import { server } from '../index.js'


const users = {};

let io
export const initSocketIO = () => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            // allowedHeaders: ["my-custom-header"],
            credentials: true,
        },
    });
    // Store connected users and their respective rooms
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        users[socket.id] = {}
        console.log({ users });
        initListeners(socket)
    });

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

}

export const initListeners = (socket) => {
    // Function to handle room joining
    socket.on('joinRoom', (roomName, username) => {
        // Leave the previous room before joining the new one
        if (users[socket.id] && users[socket.id].room) {
            socket.leave(users[socket.id].room);
        }

        // Join the new room
        socket.join(roomName);

        // Store the user's room and username
        users[socket.id] = { room: roomName, username };

        // Notify the user that they have joined the room
        socket.emit('message', { user: 'SYSTEM', text: `You have joined the room ${roomName}.` });

        // Notify other users in the room that a new user has joined
        socket.broadcast.to(roomName).emit('message', { user: 'SYSTEM', text: `${username} has joined the room.` });
    });

    // Function to handle messages within the room
    socket.on('sendMessage', (message) => {
        if (users[socket.id]) {
            const { room, username } = users[socket.id];
            io.to(room).emit('message', { user: username, text: message });
        }
    });

    socket.on('leaveRoom', () => {
        // Remove the user from the current room
        const { room, username } = users[socket.id];
        socket.leave(room);
        // Remove the user from the users object
        delete users[socket.id];
        // Emit a message to inform other users in the room
        const message = { user: 'SYSTEM', text: `${username} has left the room.` };
        io.to(room).emit('message', message);
    });

    // Function to handle user disconnection
    socket.on('disconnect', () => {
        if (users[socket.id] && users[socket.id].room) {
            const { room, username } = users[socket.id];
            io.to(room).emit('message', { user: 'system', text: `${username} has left the room.` });
        }
        delete users[socket.id];
        console.log('User disconnected:', socket.id);
        console.log({ users });
    });


    // Handle signaling messages
    socket.on('offer', (data) => {
        const { room } = users[socket.id];

        // Broadcast the offer to the intended recipient(s)
        socket.to(room).emit('offer', data);
    });

    socket.on('answer', (data) => {
        const { room } = users[socket.id];

        // Broadcast the answer to the intended recipient(s)
        socket.to(room).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        const { room } = users[socket.id];
        // Broadcast ICE candidate to the intended recipient(s)
        socket.to(room).emit('ice-candidate', data);
    });

    // Function to handle screen sharing control commands
    socket.on('controlMedia', ({ audio, video, screen }) => {
        const { room } = users[socket.id];
        // Broadcast the control commands to the intended recipient(s)
        socket.to(room).emit('controlMedia', { audio, video, screen });
    });
}