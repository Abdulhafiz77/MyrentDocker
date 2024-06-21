import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { serverError, unauthorized } from "../utils/response.js";

const adminMiddleware = async (req, res, next) => {
    try {
        const role = req.user.role
        if (role !== "admin") {
            return unauthorized(res);
        }
        next();
    } catch (error) {
        return serverError(res, error.message);
    }
}
export default adminMiddleware;