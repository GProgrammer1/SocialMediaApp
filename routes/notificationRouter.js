const express = require('express');
const notificationRouter = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

notificationRouter.get('/:userId', async (req, res) => {
console.log("Method called");

    try {
        const notifications = await Notification.find({ user: req.params.userId});
        res.json(notifications.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}); 

notificationRouter.post('/mark-read', async (req, res) => {
    try {
        const { notifications } = req.body;
        const userId = notifications[0].user;

        // Mark notifications as read
        await Notification.updateMany({ _id: { $in: notifications } }, { isRead: true });

        // Fetch and sort notifications directly in the database
        const newNotifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

        // Send sorted notifications as response
        console.log("New Notifications", newNotifications);
        
        res.json(newNotifications.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = notificationRouter;

