import { created, notFound, requestError, succes } from "../utils/response.js";
import ProvinceResource from "../resources/provinceResource.js";
import { provinceRequest } from "./requests/provinceRequest.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Province from "../models/province.js";
import express from "express";

const router = express.Router();

// Get all provinces
router.get("/", async (req, res) => {
    try {
        const provinces = await Province.find();
        const data = provinces.map(province => new ProvinceResource(province));
        return succes(res, data, "All provinces");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get one province by id
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const province = await Province.findById(id);
        if (!province) {
            return notFound(res);
        }
        const data = new ProvinceResource(province);
        return succes(res, data, "One province by id");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Get one province by code
router.get("/code/:code", async (req, res) => {
    try {
        const code = req.params.code;
        const province = await Province.findOne({code});
        if (!province) {
            return notFound(res);
        }
        const data = new ProvinceResource(province);
        return succes(res, data, "One province by code");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Add province
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reqData = req.body;
        const {code, name} = req.body;
        const {error} = provinceRequest.validate(reqData);
        if (error) {
            return requestError(res, error.message);
        }
        let province = await Province.findOne({name});
        if (province) {
            return requestError(res, "Already exsist");
        }
        province = new Province({
            code, name
        });
        await province.save();
        const data = new ProvinceResource(province);
        return created(res, data);
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Edit province by id
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const reqData = req.body;
        const {error} = provinceRequest.validate(reqData);
        if (error) {
            return requestError(res, error.message);
        }
        let province = await Province.findById(id);
        if (!province) {
            return notFound(res);
        }
        province = await Province.findByIdAndUpdate(id, reqData, {new: true});
        const data = new ProvinceResource(province);
        return succes(res, data, "updated");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Delete province by id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const province = await Province.findById(id);
        if (!province) {
            return notFound(res);
        }
        await Province.findByIdAndDelete(id);
        return succes(res, [], "Deleted");
    } catch (error) {
        return serverError(res, error.message);
    }
});

export default router;