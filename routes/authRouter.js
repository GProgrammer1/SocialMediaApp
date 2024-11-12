//TODO: FIX THE EMAIL SENDING FUNCTIONALITY IN ENDPOINTS AND USE EMAILTOKEN AND RESETTOKENS AS OBJECTS INSTEAD OF STRINGS
//TODO:KEEP USER AUTHENTICATION AND EMAIL SENDING SEPARATE


const express = require('express');
const authRouter = express.Router();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ResetToken = require('../models/ResetToken');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const RefreshToken = require('../models/RefreshToken');

require('dotenv').config();


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN
});

async function sendMail( receiver, text, subject, html) {
    try{
        const accessToken = await oauth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'bousleimengeorgio139@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const mailOptions = {
            from: 'bousleimengeorgio139@gmail.com',
            to: receiver,
            subject: subject,
            text: text,
            html: html
        };

        const result = await transporter.sendMail(mailOptions);
        return result;

    }
    catch(err){
        return err;
    }
}

authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    console.log(name, email, password);
    
    try{
        console.log(process.env.SECRET_AUTH_KEY, process.env.CLIENT_SECRET);
        

        const authToken = jwt.sign({email: email}, process.env.SECRET_AUTH_KEY, {expiresIn: '1h'});
        const emailToken = jwt.sign({email: email}, process.env.CLIENT_SECRET, {expiresIn: '1h'});

        console.log('tokens created', authToken, emailToken);
        

        const user = new User({
            name: name,
            email: email,
            password: await bcrypt.hash(password, 10),
            emailToken: new EmailVerificationToken({token: emailToken, email: email}),
            accountStatus: 'active'
        });
        console.log('user created');
        
        try {
            console.log('user created');
            
            await user.save();
            
            console.log('user saved');
        }
        
        
        catch(err){
            console.log(err.message);
        }
        

        await sendMail(email, '', 'Registration email confirmation',  `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                    }
                    .button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <h2>Email Confirmation</h2>
                <p>Hello,</p>
            
                <p>Thank you for registering with us. Please click the button below to confirm your email address:</p>
            
                <p><a href='http://localhost:4200/auth/confirm/${emailToken}' class="button">Confirm Email</a></p>
            
                <p>If you did not register with us, please ignore this email. Your account will remain inactive, and no action is required on your part.</p>
            
                <p>Thank you,<br>Your Company Name Support Team</p>
            </body>
            </html>
            `);
        res.status(200).send({message: 'Email sent successfully', email: email, authToken: authToken, emailToken: emailToken});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.post('/resendConfirmation', async (req, res) => {
    const { email } = req.body; // Accept 'email' instead of 'emailToken'
    
    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        
        if (!user) throw new Error('User not found');
        
        // Generate a new token
        const newToken = jwt.sign({ email: user.email }, process.env.CLIENT_SECRET, { expiresIn: '1h' });
        const emailToken = new EmailVerificationToken({token: newToken, email: email});
        // Update user's emailToken with the new token
        user.updateOne({emailToken: emailToken});
        await user.save();

        // Send the confirmation email with the new token link
        await sendMail(user.email, '',  `http://localhost:4200/auth/confirm/${newToken}`);

        
        res.status(200).json({ message: 'Confirmation email sent successfully', email: user.email, emailToken: newToken });
    } catch (err) {
        console.log(err.message);
        
        res.status(500).send({ error: err.message });
    }
});

authRouter.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;
    try{
        
        const decoded = jwt.verify(token, process.env.CLIENT_SECRET);
        const user = await User.findOne({email: decoded.email});
        user.accountStatus = 'active';
        await user.save();
        console.log(user);
        
        res.status(200).send({email: decoded.email});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }

});

authRouter.delete('/delete/:email', async (req, res) => {
    const { email } = req.params;
    try{
        const user = await User.findOneAndDelete({email: email});
        res.status(200).send({email: email});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.delete('/deleteAll', async (req, res) => {
    try{
        const users = await User.deleteMany();
        res.status(200).send({users: users});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.get('/users', async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).send({users: users});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    try{
        
        const token = jwt.sign({email: email}, process.env.SECRET_RESET_KEY, {expiresIn: '1h'});
        const link = `http://localhost:4200/auth/resetPassword/${token}`;
        const resetToken = new ResetToken({
            email: email,
            token: token
        });
        console.log('token created');
        
        await resetToken.save();
        console.log('token saved');
        
        const user = await User.findOne({email: email});
        console.log('user found');
        console.log(resetToken._id);
        
        user.updateOne({resetToken: resetToken._id});
        await user.save();

        console.log('token saved for user');
        

        await sendMail(email, '', 'Password Reset', 
            `<!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .button {
                            background-color: #007bff;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                        }
                        .button:hover { background-color: #0056b3; }
                    </style>
                </head>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>

                    <p>We received a request to reset the password for your account. If you made this request, please click the button below to reset your password:</p>

                    <p><a href='${link}' class="button">Reset Password</a></p>

                    <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged, and no action is required on your part.</p>

                    <p>For security reasons, this link will expire in 1 hour.</p>

                    <p>Thank you,<br>Your Company Name Support Team</p>
                </body>
                </html>
`
        );
        res.status(200).send({message: 'Email sent successfully', email: email, resetToken: token});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.post('/resetPassword/:token', async (req, res) => {
    const { token } = req.params;
    console.log(token);
    console.log(req.body);
    
    const { newPassword } = req.body;
   
    
    try{
        const decoded = jwt.verify(token, process.env.SECRET_RESET_KEY);
        console.log(decoded);
        if (!decoded) throw new Error('Invalid token');
        const user = await User.findOne({email: decoded.email});
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).send({email: decoded.email});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

// authRouter.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try{
//         const user = await User.findOne({email: email});
//         console.log(user);
        
//         if(!user) res.status(404).send({err: 'User not found'});
//         const isMatch = await bcrypt.compare(password, user.password);
//         if(!isMatch) res.status(401).send({err: 'Invalid password'});

//         if(user.accountStatus !== 'active') res.status(401).send({err: 'Account is inactive'});
        
//         const refreshToken = jwt.sign({email: email}, process.env.SESSION_REFRESH_KEY, {expiresIn: '7d'});
//         const token = jwt.sign({email: email}, process.env.SECRET_AUTH_KEY, {expiresIn: '1h'});

//         console.log(refreshToken, token);
        
//         await user.updateOne({refreshToken: new RefreshToken({token: refreshToken})});

//         console.log(res);
        
        
//         res.status(200).send({authToken: token, email: email});
        
//     }
//     catch(err) {
//         res.status(500).send({err: err.message});
//     }
// }
// );

authRouter.put('/deactivate', async (req, res) => {
    const { email } = req.body;
    try{
        const user = await 
        User
        .findOne({email: email});
        user.accountStatus = 'inactive';
        await user.save();
        console.log('User account deactivated');
        
        res.status(200).send({email: email});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.post('/activate', async (req, res) => {
    const { email } = req.body;
    try{
        const user
        = await 
        User
        .findOne({email: email});
        user.accountStatus = 'active';
        await user.save();
        res.status(200).send({email: email});
    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

authRouter.put('/updateUser/:email', async (req, res) => {
    console.log(req.body);
    
    const {email} = req.params;
    try{
        const user = await User.findOne({email: email});
        for (let key in req.body){
            user[key] = req.body[key];
        }
        await user.save();
        res.status(200).send({user: user});


    }
    catch(err){
        res.status(500).send({err: err.message});
    }
}
);

// authRouter.post('/logout', async (req, res) => {
//     const {email} = req.body ;
//     try {
//     const user = await User.findOne({email: email});
//     user.refreshToken = '';
//     await user.save();
//     res.status(200).send({ message: 'Logged out successfully' });
//     }
//     catch(err){
//         res.status(500).send({err: err.message});
//     }
// });

// authRouter.post('/refreshToken', async (req, res) => {
   
//     const { email } = req.body;
//     const user = await User.findOne({ email: email });
//     if (!user) {
//         return res.status(404).send({ error: 'User not found' });
//     }

//     const refreshTokenId = user.refreshToken;
//     const refreshToken = await RefreshToken.findById(refreshTokenId); 
//     const tokenString = refreshToken.token;
//     if (!refreshToken) {
//         return res.status(401).send({ error: 'No refresh token provided' });
//     }

//     try {
//         const decoded = jwt.verify(tokenString, process.env.SESSION_REFRESH_KEY);
//         const user = await User.findOne({ email: decoded.email });
//         if (!user) {
//             res.status(404).send({ error: 'User not found' });
//         }
//         const authToken = jwt.sign({ email: user.email }, process.env.SECRET_AUTH_KEY, { expiresIn: '1h' });
//         res.status(200).send({ authToken: authToken, user: user });
//     }
//     catch (e) {
//         res.status(401).send({ error: e.message });
//     }
// }
// );



// Middleware to parse cookies
const cookieParser = require('cookie-parser');
authRouter.use(cookieParser());

// Logout route
authRouter.post('/logout', async (req, res) => {
    try {
        res.clearCookie('refreshToken'); // Clear the refresh token cookie
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).send({ err: err.message });
    }
});

// Refresh token route
authRouter.post('/refreshToken', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // Access the refresh token from cookies
        if (!refreshToken) {
            return res.status(401).send({ error: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.SESSION_REFRESH_KEY);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const authToken = jwt.sign({ email: user.email }, process.env.SECRET_AUTH_KEY, { expiresIn: '1h' });
        res.status(200).send({ authToken: authToken, user: user });
    } catch (e) {
        res.status(401).send({ error: e.message });
    }
});

// Example route to set the refresh token cookie (e.g., during login)
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    
    try {
        const user = await User.findOne({email: email });
        if (!user) {
            return res.status(400).send({ error: 'Login failed!' });
        }

        const refreshToken = jwt.sign({ email: user.email }, process.env.SESSION_REFRESH_KEY, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' }); // Set the refresh token as an HTTP-only cookie

        const authToken = jwt.sign({ email: user.email }, process.env.SECRET_AUTH_KEY, { expiresIn: '1h' });
        res.status(200).send({ authToken: authToken, user: user });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = authRouter;




module.exports = authRouter;



