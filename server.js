const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const Chat = require('./models/Chat');
const User = require('./models/User');
const Message = require('./models/Message');
const postRouter = require('./routes/postRouter');
const notificationRouter = require('./routes/notificationRouter');
app.use(express.static('public'));

const allowedOrigins = ['http://localhost:4200', 'http://localhost:53547', 'http://localhost:3000', 'http://localhost:53595', 'http://localhost:53647', 'http://localhost:63257'];
const originHandler = (origin, callback) => {
    console.log('Origin', origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
    } else {
        callback(new Error('Origin not allowed'), false);
    }
};
// const swaggerAutogen = require('swagger-autogen')();

// const doc = {
//   info: {
//     title: 'My API',
//     description: 'API documentation',
//   },
//   host: 'localhost:3000',
//   schemes: ['http'],
// };

// const outputFile = './swagger-output.json'; // Output Swagger JSON file
// const endpointFiles = ['./routes/*.js']; // Path to your route files

// swaggerAutogen(outputFile, endpointFiles, doc).then(() => {
//   require('./app'); // Start your Express app after generating the Swagger docs
// });
// const options = {
//     definition: './swagger-output.json',
//     apis: ['./routes/*.js'], // Path to your API route files
//   };
  
  // Initialize swagger-jsdoc
//   const swaggerSpec = swaggerJSDoc(options);
// app.get('/swagger.json', (req, res) => {
//     res.json(swaggerSpec);
//   });

app.use(cookieParser());
const cors = require('cors');
app.use(cors({
    origin: originHandler,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors({
    origin: originHandler,
    credentials: true
}));


app.set('view engine', 'ejs');
app.set('views', 'views');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/techApp', {

}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
}
);

// Middleware
app.use(express.json());
app.use('/user', require('./routes/userRouter'));

const authRouter = require('./routes/authRouter');
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/notification', notificationRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Import required modules

const http = require('http');
const { Server } = require('socket.io');
const useChatNamespace = require('./namespaces/chatnamespace');
const useFriendRequestsNamespace = require('./namespaces/friendrequestsnamespace');
const usePostNamespace = require('./namespaces/postnamespace');
// Initialize express app and create an HTTP server
const server = http.createServer(app);


// Initialize Socket.IO on the server
const io = new Server(server, {
    cors: {
        origin: originHandler,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});



// Set up Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle events from the client
    socket.on('message', (data) => {
        console.log('Message received:', data);
        // Broadcast the message to all connected clients
        io.emit('message', data);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
useFriendRequestsNamespace(io);
useChatNamespace(io);
usePostNamespace(io);


    // Event for disconnecting from a chat room
// Start the server
const PORT = 4000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = io;



//Socket Server 
// fetch('http://localhost:3000/auth/deleteAll', {
//     method: 'DELETE'
// }).then(response => response.json()).then(data => console.log(data)).catch(err => console.log(err));

// fetch('http://localhost:3000/auth/users').then(response => response.json()).then(data => console.log(data)).catch(err => console.log(err));
// fetch('http://localhost:3000/auth/register', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         name: 'Georgio Bou Sleiman',
//         email: 'bousleimengeorgio139@gmail.com',
//         password: '123456'
//     })
// }).then(response => response.json()).then(data => console.log(data)).catch(err => console.log(err));