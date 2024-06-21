import { locationRequest } from './requests/locationRequest.js';
import LocationResource from '../resources/locationResource.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Location from '../models/location.js';
import District from '../models/district.js';
import Province from '../models/province.js';
import express from 'express';

const router = express.Router();

const populate = [
    { path: "province" },
    {
        path: "district",
        populate: [
            { path: "province" }
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

// Get location all
router.get('/', async (req, res) => {
    try {
        const locations = await Location.find().populate(populate);
        const data = locations.map(location => new LocationResource(location));
        return res.send({
            success: true,
            data: data,
            message: 'All locations',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error,
            message: error.message,
        });
    }
});

// Get location by id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const location = await Location.findById(id).populate(populate);

        if (!location) notFound(req, res, "Location");

        const data = new LocationResource(location);

        return res.status(200).json({
            success: true,
            data: data,
            message: 'One location'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error,
            message: error.message,
        });
    }
});

// Add location
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bodyData = req.body;
        const { error } = locationRequest.validate(bodyData);

        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }

        const district = await District.findById(req.body.district);
        const province = await Province.findById(req.body.province);

        if (!district) notFound(req, res, "District");
        if (!province) notFound(req, res, "Province");

        const location = new Location(bodyData);
        await location.save();
        await location.populate(populate);

        const data = new LocationResource(location);
        return res.status(201).json({
            success: true,
            data: data,
            message: 'Created'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error,
            message: error.message,
        });
    }
});

// Edit location by id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, bb) => {
    try {
        const bodyData = req.body;
        const id = req.params.id;
        const {error} = locationRequest.validate(bodyData);

        let location = await Location.findById(id);
        if (!location) notFound(req, res, "Location");

        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        const district = await District.findById(req.body.district);
        const province = await Province.findById(req.body.province);

        if (!district) notFound(req, res, "District");
        if (!province) notFound(req, res, "Province");

        location = await Location.findByIdAndUpdate(id, bodyData, {new: true});
        await location.populate(populate);

        const data = new LocationResource(location);

        return res.status(200).json({
            success: true,
            data,
            message: 'Updated',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error,
            message: error.message,
        });
    }
});

// Delete location by id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            data: [],
            message: "Deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error,
            message: error.message,
        });
    }
})

export default router;