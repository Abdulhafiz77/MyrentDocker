import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Notification from '../models/notification.js';
import NotificationResource from '../resources/notificationResource.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { notificationsRequest } from './requests/natificationsRequest..js';
import User from '../models/user.js';
import Estate from '../models/estate.js';
const router = express.Router();



const populate = [
    { path: "user" },
    {
        path: "estate",
        populate: [
            { path: "seller" },
            { path: "type" },
            {
                path: "detailedType",
                populate: [
                    { path: "parent" }
                ]
            },
            { path: "details" },
            {
                path: "location",
                populate: [
                    { path: "province" },
                    {
                        path: "district",
                        populate: [
                            { path: "province" }
                        ]
                    }
                ]
            }
        ]
    },
];


const notFound = (req, res, name) => {
    return res.status(404).json({
        status: false,
        data: [],
        message: `${name} not found`
    });
}
// get notification by id
router.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const notification = await Notification.findById(id).populate(populate);

        if (!notification) {
            return res.status(404).json({
                status: false,
                data: null,
                message: `Notificaton with ID ${id} not found`,
            });
        }

        const data = new NotificationResource(notification);
        return res.status(200).json({
            status: true,
            data,
            message: `Notification with ID ${id} found`,
        });
    } catch (error) {
        next(error);
    }
});

// get all notificaton
router.get('/', async (req, res, next) => {
    try {
        const notifications = await Notification.find().populate(populate);
        const data = notifications.map(notification => new NotificationResource(notification));
        return res.send({
            success: true,
            data: data,
            message: 'All Notifications',
        });
    } catch (error) {
        next(error)
    }
});

//get notification by user
router.get("user/:userId", async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({ user: userId }).populate(populate);

        if (!notifications.length) {
            return res.status(404).json({
                status: false,
                message: `No notifications found for user with ID ${userId}`,
            });
        }

        const data = notifications.map(notification => new NotificationResource(notification));
        return res.status(200).json({
            status: true,
            data,
            message: `Notifications for user with ID ${userId} found`,
        });
    } catch (error) {
        next(error);
    }
});

// add notification
router.post('/add', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const bodyData = req.body;
        const { error } = notificationsRequest.validate(bodyData);

        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }


        const user = await User.findById(req.body.user);
        const estate = await Estate.findById(req.body.estate);

        if (!user) return notFound(req, res, "User");
        if (!estate) return notFound(req, res, "Estate");

        const notificationData = {
            user: user._id,
            estate: estate._id,
            message: bodyData.message
        };

        const notification = new Notification(notificationData);
        await notification.save();
        await notification.populate(populate);

        const data = new NotificationResource(notification);
        return res.status(201).json({
            success: true,
            data: data,
            message: 'Created notification'
        });
    } catch (error) {
        next(error);
    }
});

//delete notification by id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const notifications = await Notificaton.findById(id);
        if (!notifications) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        await Notificaton.findByIdAndDelete(id);
        return res.status(200).json({
            status: true,
            data: [],
            message: "Deleted"
        });
    } catch (error) {
        next(error);
    }
});
export default router;