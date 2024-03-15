const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/main', (req, res) => {
    const username = req.body.username;
    if (username) {
        res.redirect(`/main.html?username=${encodeURIComponent(username)}`);
    } else {
        res.status(400).send('Username is required');
    }
});

app.get('/chat.html', (req, res) => {
    const userName = req.query.username;

    if (!userName) {
        return res.status(400).send('Username is missing');
    }

    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user joined', (userName) => {
        console.log(`${userName} joined the chat`);
        socket.broadcast.emit('user joined', userName);
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
