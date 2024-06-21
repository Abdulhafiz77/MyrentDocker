import User from "../models/user.js";

const userSeeder = async () => {
    try {
        await User.deleteMany({});
        var user = new User({
            name: "Admin",
            email: "admin@gmail.com",
            phone: "745644654",
            password: "24071",
            role: "admin"
        });
        await user.save();
        user.userVerify();
    } catch (error) {
        console.error("User seeder don\'t work:", error);
    }
}

export default userSeeder;