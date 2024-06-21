import EstateWithoutResource from "./estateWithoutResource.js";

export default class UserWithResource {
    constructor(user) {
        this.id = user._id,
        this.name = user.name,
        this.email = user.email,
        this.phone = user.phone,
        this.image = user.image,
        this.role = user.role,
        this.favorites = user.favorites.map(favorite => new EstateWithoutResource(favorite)),
        this.verified = user.verified,
        this.createdAt = user.createdAt.toDateString();
        this.updatedAt = user.updatedAt.toDateString();
    }
}
