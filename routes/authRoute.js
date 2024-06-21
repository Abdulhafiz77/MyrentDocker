import { created, requestError, serverError, succes, unauthorized } from "../utils/response.js";
import { loginRequest, registerRequest } from "./requests/authRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import UserResource from "../resources/userResource.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const loginData = req.body;
        const { email, password } = req.body;
        const { error } = loginRequest.validate(loginData);
        if (error) {
            return requestError(res, error.message, true);
        } else {
            const user = await User.findOne({ email });
            if (!user) {
                return unauthorized(res, "Data incorrect", true);
            }
            const isCheck = user.checkPassword(password);
            if (isCheck) {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "3d"
                });
                const data = new UserResource(user);
                return succes(res, data, "Account logged in", token);
            }
            return unauthorized(res, "Data incorrect", true);
        }
    } catch (error) {
        return serverError(res, error.message, false, true);
    }
});
router.post("/register", async (req, res) => {
    try {
        const registerData = req.body;
        const { name, email, phone, password } = req.body;
        const { error } = registerRequest.validate(registerData);
        if (error) {
            return requestError(res, error.message, true);
        } else {
            let user = await User.findOne({ email });
            if (user) {
                return requestError(res, `${email} alredy exsist`, true);
            }
            const newUser = new User({
                name, email, phone, password
            });
            user = await newUser.save();
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "3d"
            });
            const data = new UserResource(user);
            return created(res, data, "Created", token);
        }
    } catch (error) {
        return serverError(res, error.message, false, true);
    }
});
router.post("/logout", authMiddleware, async (req, res) => {

});
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const data = new UserResource(req.user);
        return succes(res, data, "User");
    } catch (error) {
        return serverError(res, error.message);
    }
});
router.get("/verify", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.verified) {
            return requestError(res, "You have alredy verified");
        }
        user.userVerify();
        const data = new UserResource(user);
        return succes(res, data, "User");
    } catch (error) {
        return serverError(res, error.message);
    }
});
export default router;