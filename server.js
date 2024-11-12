const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:4200',
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


const authRouter = require('./routes/authRouter');
app.use('/auth', authRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

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