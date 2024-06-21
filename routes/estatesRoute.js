import { created, notFound, pagination, requestError, serverError, succes, unauthorized } from '../utils/response.js';
import EstateWithoutResource from '../resources/estateWithoutResource.js';
import { getAsync, setAsync } from '../utils/redis.server.js';
import authMiddleware from '../middleware/authMiddleware.js';
import EstateResource from '../resources/estateResource.js';
import { estateRequest } from './requests/estateRequest.js';
import DetailedType from '../models/detailedType.js';
import Location from '../models/location.js';
import Details from '../models/details.js';
import Estate from '../models/estate.js';
import Type from '../models/type.js';
const router = express.Router();
import express from 'express';

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

// Get all estates
router.get('/', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const count = await Estate.countDocuments();

        //redis
         const cacheKey = `estates_page_${page}_limit_${limit}`;
          const cachedData = await getAsync(cacheKey);

         if (cachedData) {
             return res.status(200).json({
                 message: 'Estates retrieved successfully (from cache)',
                 data: JSON.parse(cachedData),
                 success: true,
                 currentPage: page,
                 pagesCount: Math.ceil(count / limit),
                 nextPage: Math.ceil(count / limit) < page + 1 ? null : page + 1,
             });
         }

        const estates = await Estate.find({ status: true }).skip((page * limit) - limit).limit(limit).populate(populate);

        //  await setAsync(cacheKey, JSON.stringify(estates), 'EX', 3600); // 1 hour

        const data = estates.map(estate => new EstateResource(estate));
        return pagination(res, "All estates", data, page, count, limit);
         }
     catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get all filtered estates
router.get('/filter', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;

        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;
        const minSize = req.query.minSize ? parseFloat(req.query.minSize) : 0;
        const maxSize = req.query.maxSize ? parseFloat(req.query.maxSize) : Infinity;
        const category = req.query.category;
        const type = req.query.type;
        const detailedType = req.query.detailedType;
        const province = req.query.province;
        const district = req.query.district;

        const filterConditions = {
            status: true,
            price: { $gte: minPrice, $lte: maxPrice },
            size: { $gte: minSize, $lte: maxSize }
        };

        if (category) filterConditions.category = category;
        if (type) filterConditions.type = type;
        if (detailedType) filterConditions.detailedType = detailedType;

        const locationConditions = {};
        if (province) locationConditions.province = province;
        if (district) locationConditions.district = district;

        let locationIds = [];
        if (province || district) {
            const locations = await Location.find(locationConditions, '_id');
            filterConditions.location = locations.map(location => location._id);
        }

        if (locationIds.length > 0) {
            searchConditions.location = { $in: locationIds };
        }

        const count = await Estate.countDocuments(filterConditions);

        const estates = await Estate.find(filterConditions).skip((page * limit) - limit).limit(limit).populate(populate);

        const data = estates.map(estate => new EstateResource(estate));
        return pagination(res, "All filtered estates", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get searched estates
router.get('/search', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const search = req.query.search;
        const sortBy = req.query.sortBy;
        const order = req.query.order;
        const lowerCasedSearch = search.toLowerCase();

        const searchConditions = {
            status: true,
            $or: [
                { 'location.province.name': { $regex: lowerCasedSearch, $options: 'i' } },
                { 'location.district.name': { $regex: lowerCasedSearch, $options: 'i' } },
                { 'location.address': { $regex: lowerCasedSearch, $options: 'i' } },
                { title: { $regex: lowerCasedSearch, $options: 'i' } }
            ]
        };

        const count = await Estate.countDocuments(searchConditions);

        const estates = await Estate.find(searchConditions).skip((page * limit) - limit).limit(limit).populate(populate).sort(
            sortBy === "price"
                ? { price: order === "asc" ? "asc" : "desc" }
                : { updatedAt: order === "asc" ? "asc" : "desc" }
        );

        const data = estates.map(estate => new EstateResource(estate));

        return pagination(res, "All searched estates", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get all sorted estates by date
router.get('/sorteddate', async (req, res) => {
    try {
        const desc = req.params.desc;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const count = await Estate.countDocuments();

        //redis
        // const cacheKey = `estates_page_${page}_limit_${limit}`;
        // const cachedData = await getAsync(cacheKey);

        // if (cachedData) {
        //     return res.status(200).json({
        //         message: 'Estates retrieved successfully (from cache)',
        //         data: JSON.parse(cachedData),
        //         success: true,
        //         currentPage: page,
        //         pagesCount: Math.ceil(count / limit),
        //         nextPage: Math.ceil(count / limit) < page + 1 ? null : page + 1,
        //     });
        // }

        const estates = await Estate.find({ status: true }).sort({ updatedAt: desc ? "desc" : "asc" }).skip((page * limit) - limit).limit(limit).populate(populate);

        // await setAsync(cacheKey, JSON.stringify(estates), 'EX', 3600); // 1 hour

        const data = estates.map(estate => new EstateResource(estate));

        return pagination(res, "All sorted estates", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get all sorted estates by price
router.get('/sortedprice', async (req, res) => {
    try {
        const desc = req.params.desc;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const count = await Estate.countDocuments();

        //redis
        //   const cacheKey = `estates_page_${page}_limit_${limit}`;
        //   const cachedData = await getAsync(cacheKey);

        //   if (cachedData) {
        //       return res.status(200).json({
        //           message: 'Estates retrieved successfully (from cache)',
        //           data: JSON.parse(cachedData),
        //           success: true,
        //           currentPage: page,
        //           pagesCount: Math.ceil(count / limit),
        //           nextPage: Math.ceil(count / limit) < page + 1 ? null : page + 1,
        //       });
        //   }

        const estates = await Estate.find({ status: true }).sort({ price: desc ? "desc" : "asc" }).skip((page * limit) - limit).limit(limit).populate(populate);

        // await setAsync(cacheKey, JSON.stringify(estates), 'EX', 3600); // 1 hour

        const data = estates.map(estate => new EstateResource(estate));

        return pagination(res, "All sorted estates", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get estates by seller
router.get('/seller/:id', authMiddleware, async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 16;
        const count = await Estate.countDocuments();
        const seller = req.params.id;
        const user = req.user;

        //redis
        // const cacheKey = `estates_page_${page}_limit_${limit}`;
        // const cachedData = await getAsync(cacheKey);

        // if (cachedData) {
        //     return res.status(200).json({
        //         message: 'Estates retrieved successfully (from cache)',
        //         data: JSON.parse(cachedData),
        //         success: true,
        //         currentPage: page,
        //         pagesCount: Math.ceil(count / limit),
        //         nextPage: Math.ceil(count / limit) < page + 1 ? null : page + 1,
        //     });
        // }

        const estates = await Estate.find({ seller: user._id, status: true }).skip((page * limit) - limit).limit(limit).populate(populate);

        // await setAsync(cacheKey, JSON.stringify(estates), 'EX', 3600); // 1 hour

        const data = estates.map(estate => new EstateResource(estate));

        return pagination(res, "Get estates by seller", data, page, count, limit);
    } catch (error) {
        return serverError(res, error.message, true);
    }
});

// Get estate by id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // RedisФ
        const estate = await Estate.findById(id).populate(populate);

        if (!estate) {
            return notFound(res);
        }

        const data = new EstateResource(estate);

         await setAsync(id, JSON.stringify(data), 'EX', 3600); // 1 hour

        return succes(res, data, "One estate by id");
        // }
    }
     catch (error) {
        return serverError(res, error.message);
    }
});

// Add estate
router.post('/', authMiddleware, async (req, res) => {
    try {
        const estateData = req.body;
        const user = req.user;
        const { error } = estateRequest.validate(estateData);

        if (error) {
            return requestError(res, error.message);
        }

        const type = await Type.findById(req.body.type);
        const detailedType = await DetailedType.findById(req.body.detailedType);
        const details = await Details.findById(req.body.details);
        const location = await Location.findById(req.body.location);

        if (!type) notFound(res, `${type} not found`);
        if (!detailedType) notFound(res, `${detailedType} not found`);
        if (!details) notFound(res, `${details} not found`);
        if (!location) notFound(res, `${location} not found`);

        const estate = new Estate({
            seller: user._id,
            ...estateData
        });

        await estate.save();
        await estate.populate(populate);

        const data = new EstateWithoutResource(estate);

        return created(res, data);
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Edit estate by id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const estateData = req.body;
        const id = req.params.id;
        const user = req.user;

        let estate = Estate.findById(id);
        if (!estate) {
            notFound();
        }
        if (user.role !== "admin") {
            if (estate.seller !== user._id) {
                return unauthorized(res);
            }
        }
        const { error } = estateRequest.validate(estateData);

        if (error) {
            return requestError(res, error.message);
        }

        const type = await Type.findById(req.body.type);
        const detailedType = await DetailedType.findById(req.body.detailedType);
        const details = await Details.findById(req.body.details);
        const location = await Location.findById(req.body.location);

        if (!type) notFound(res, `${type} not found`);
        if (!detailedType) notFound(res, `${detailedType} not found`);
        if (!details) notFound(res, `${details} not found`);
        if (!location) notFound(res, `${location} not found`);

        estate = await Estate.findByIdAndUpdate(id, estateData, { new: true });
        await estate.populate(populate);

        const data = new EstateWithoutResource(estate);

        return succes(res, data, "Updated");
    } catch (error) {
        return serverError(res, error.message);
    }
});

// Delete estate by id
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const estate = Estate.findById(id);
        if (!estate) {
            return notFound(res);
        }
        if (user.role !== "admin") {
            if (estate.seller !== user._id) {
                return unauthorized(res)
            }

        }
        await Estate.findByIdAndDelete(id);
        return succes(res, [], "Deleted");
    } catch (error) {
        return serverError(res, error.message);
    }
});

export default router;