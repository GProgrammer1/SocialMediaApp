// const express = require('express');
// const friendrequestRouter = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');
// const authMiddleware = require('../middlewares/authMiddleware');
// const FriendRequest = require('../models/FriendRequest');
// require('dotenv').config();

// friendrequestRouter.post('/sendRequest/:email', authMiddleware, async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }
//         const friendRequest = new FriendRequest({
//             sender: req.user._id,
//             receiver: user._id
//         });
//         await friendRequest.save();
//         res.status(201).send(friendRequest);
//     } catch (e) {
//         res.status(400).send({ error: e.message });
//     }
// }
// );

// friendrequestRouter.get('/requests', authMiddleware, async (req, res) => {
//     try {
//         const requests = await FriendRequest.find({ receiver: req.user._id });
//         res.send(requests);
//     } catch (e) {
//         res.status(500).send({ error: e.message });
//     }
// }
// );

// friendrequestRouter.delete('/request/:id', authMiddleware, async (req, res) => {
//     try {
//         const request = await FriendRequest.findOneAndDelete({ _id: req.params.id, receiver: req.user._id });
//         if (!request) {
//             return res.status(404).send({ error: 'Request not found' });
//         }
//         res.send(request);
//     } catch (e) {
//         res.status(500).send({ error: e.message });
//     }
// }
// );

// friendrequestRouter.post('/acceptRequest/:id', authMiddleware, async (req, res) => {
//     try {
//         const request = await FriendRequest.findOneAndDelete({ _id: req.params.id, receiver: req.user._id });
//         if (!request) {
//             return res.status(404).send({ error: 'Request not found' });
//         }
//         const user = await User.findOne({ _id: request.sender });

//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }
        
//         req.user.friends.push(user._id);
//         user.friends.push(req.user._id);
//         await req.user.save();
//         await user.save();
//         res.send({ message: 'Friend added successfully' });
//     } catch (e) {
//         res.status(500).send({ error: e.message });
//     }
// }
// );

// module.exports = friendrequestRouter;

