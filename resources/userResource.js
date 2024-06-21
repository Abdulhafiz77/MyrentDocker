export default class UserResource {
    constructor(user) {
        this.id = user._id,
        this.name = user.name,
        this.email = user.email,
        this.phone = user.phone,
        this.image = user.image,
        this.verified = user.verified,
        this.createdAt = user.createdAt.toDateString();
        this.updatedAt = user.updatedAt.toDateString();
    }
}
