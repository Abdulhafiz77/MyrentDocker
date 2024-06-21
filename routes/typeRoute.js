import { created, notFound, requestError, serverError, succes } from "../utils/response.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { typeRequest } from "./requests/typeRequest.js";
import TypeResource from "../resources/typeResource.js";
import Type from "../models/type.js";
import express from "express";

const router = express.Router();

// Get all types
router.get("/", async (req, res) => {
    try {
        const types = await Type.find();
        const data = types.map(type => new TypeResource(type));
        return succes(res, data, "All types");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get one type by id
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const type = await Type.findById(id);
        if (!type) {
            return notFound(res);
        }
        const data = new TypeResource(type);
        return succes(res, data, "One type by id");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Add type by id
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reqData = req.body;
        const {error} = typeRequest.validate(reqData);
        if (error) {
            return requestError(res, error.message);
        }
        let type = await Type.findOne({name: req.body.name});
        if (type) {
            return requestError(res, "Already exsist");
        }
        type = new Type({
            name: req.body.name
        });
        await type.save();
        const data = new TypeResource(type);
        return created(res, data);
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Edit type by id
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const reqData = req.body;
        const {error} = typeRequest.validate(reqData);
        if (error) {
            return requestError(res, error.message);
        }
        let type = await Type.findById(id);
        if (!type) {
            return notFound(res);
        }
        type = await Type.findByIdAndUpdate(id, reqData, {new: true});
        const data = new TypeResource(type);
        return succes(res, data, "Updated");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Delete type by id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const type = await Type.findById(id);
        if (!type) {
            return notFound(res);
        }
        await Type.findByIdAndDelete(id);
        return succes(res, [], "Deleted");
    } catch (error) {
        return serverError(res, error.message);
    }
});

export default router;