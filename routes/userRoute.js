import { userDestroyRequest, userRoleRequest, userUpdateDataRequest, userUpdatePasswordRequest } from "./requests/userRequest.js";
import { notFound, pagination, requestError, serverError, succes, unauthorized } from "../utils/response.js";
import UserWithResource from "../resources/userWithResource.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import EstateResource from "../resources/estateResource.js";
import UserResource from "../resources/userResource.js";
import Estate from "../models/estate.js";
import User from "../models/user.js";
import express from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

const populate = [
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
];
const favoritesPopulate = [
    {
        path: "favorites",
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
    }
];

// Get all users
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const count = await User.countDocuments();

        const users = await User.find().skip((page * limit) - limit).limit(limit).populate(favoritesPopulate);

        const data = users.map(user => new UserWithResource(user));

        return pagination(res, "All users", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get one user by id
router.get("/id/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findById(id).populate(favoritesPopulate);

        if (!user) {
            return notFound(res);
        }

        const data = new UserWithResource(user);

        return succes(res, data, "One user by id")
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get one user by email
router.get("/email", authMiddleware, async (req, res) => {
    try {
        const email = req.query.email;

        const user = await User.findOne({ email });

        if (!user) {
            return notFound(res);
        }

        const data = new UserResource(user);

        return succes(res, data, "One user by email");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get users by favorite
router.get("/favorite/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const estate = Estate.findById(id);

        if (!estate) {
            return notFound(res);
        }
        const users = await User.find({ favorites: id });

        const data = users.map(user => new UserResource(user));

        return succes(res, data, "User list");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Add , remove fovorites
router.get("/favorites/toggle/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const estate = await Estate.findById(id);

        if (!estate) {
            return notFound(res);
        }

        const isFavorited = req.user.favorites.includes(id);
        if (!isFavorited) {
            req.user.favorites.push(id);
        } else {
            req.user.favorites = req.user.favorites.filter(fav => fav != id);
        }
        await req.user.save();

        const favorite = await Estate.findById(id).populate(populate);

        const data = new EstateResource(favorite);

        return succes(res, data, isFavorited ? "Remove favorites list" : "Add favorites list");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get user's favorites
router.get("/favorites", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("favorites");

        const data = await Promise.all(user.favorites.map(async (estateId) => {
            const estate = await Estate.findById(estateId).populate(populate);
            return new EstateResource(estate);
        }));

        return succes(res, data, "All favoirites list");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// User data updated
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const updateData = req.body;
        const { error } = userUpdateDataRequest.validate(updateData);
        if (error) {
            return requestError(res, error.message);
        }

        const user = await User.findByIdAndUpdate(req.user._id, {
            name: updateData.name,
            image: updateData.image,
            phone: updateData.phone,
            email: updateData.email,
        }, { new: true });

        const data = new UserResource(user);

        return succes(res, data, "User updated");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// User password update
router.put("/password", authMiddleware, async (req, res) => {
    try {
        const updatePassword = req.body;
        const { error } = userUpdatePasswordRequest.validate(updatePassword);
        if (error) {
            return requestError(res, error.message);
        }

        const isCheck = req.user.checkPassword(updatePassword.old_password);
        if (!isCheck) {
            return unauthorized(res, "Password incorrect");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updatePassword.password, salt);
        const user = await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword,
        }, { new: true });

        const data = new UserResource(user);

        return succes(res, data, "User password updated");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Change user role
router.post("/role/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const roleData = req.body;

        const { error } = userRoleRequest.validate(roleData);
        if (error) {
            return requestError(res, error.message);
        }

        let user = await User.findById(id);
        if (!user) {
            return notFound(res);
        }

        user = await User.findByIdAndUpdate(id, { role: roleData.role }, { new: true });

        const data = new UserWithResource(user);

        return succes(res, data, "User role changed");
    } catch (error) {
        return serverError(res, error.message);
    }
})

// User account delete
router.delete("/destroy", authMiddleware, async (req, res) => {
    try {
        const passwords = req.body;
        const role = req.user.role

        if (role == "admin") {
            return requestError(res, "Not possible, You are admin");
        }

        const { error } = userDestroyRequest.validate(passwords);
        if (error) {
            return requestError(res, error.message);
        }

        const isCheck = req.user.checkPassword(passwords.password);
        if (!isCheck) {
            return unauthorized(res, "Password incorrect");
        }

        await User.findByIdAndDelete(req.user._id);
        
        return succes(res, [], "User deleted");
    } catch (error) {
        return serverError(res, error.message);
    }
});

export default router;
