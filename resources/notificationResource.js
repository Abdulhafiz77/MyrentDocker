import UserResource from "./userResource.js";
import EstateResource from "./estateResource.js";

export default class NotificationResource {
    constructor(notification) {
        this.id = notification._id,
        this.message = notification.message,
        this.user = notification.user ? new UserResource(notification.user) : null,
        this.estate = notification.estate ? new EstateResource(notification.estate) : null,
        this.status = notification.status,
        this.createdAt = notification.createdAt.toDateString();
        this.updatedAt = notification.updatedAt.toDateString();
    }
}