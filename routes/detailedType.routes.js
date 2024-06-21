import express from 'express';
import DetailedType from '../models/detailedType.js';
import authMiddleware from '../middleware/authMiddleware.js';
import DetailedTypeResource from '../resources/detailsTypeResource.js';
import { detailedTypeRequest } from './requests/detailedTypeRequest.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// get detailed type by id
router.get("/:id", async (req, res, next) => {
	try {
	  const id = req.params.id; 
	  const detailedType = await DetailedType.findById(id).populate("parent"); 
	  
	  if (!detailedType) {
		return res.status(404).json({
		  status: false,
		  data: null,
		  message: `Detailed type with ID ${id} not found`,
		});
	  }

	  const data = new DetailedTypeResource(detailedType);
	  return res.status(200).json({
		status: true,
		data,
		message: `Detailed type with ID ${id} found`,
	  });
	} catch (error) {
        next(error);
      }
  });

// get detailed types
router.get("/", async (req, res, next) => {
    try {
        const detailedTypes = await DetailedType.find().populate("parent");
        const data = detailedTypes.map(detailsType => new DetailedTypeResource(detailsType));
        return res.status(200).json({
            status: true,
            data,
            message: "All detailed types"
        });
    } catch (error) {
        next(error);
      }
});
//get detailed type by parent
router.get("types/:parentId",  async (req, res, next) => {
    try {
      const parentId = req.params.parentId;
      const detailedType = await DetailedType.find({ parent: parentId });

      if (!detailedType.length) {
        return res.status(404).json({
          status: false,
          message: `No detailedTypes found for parent with ID ${parentId}`,
        });
      }

      const data = detailedType.map(detailsType => new DetailedTypeResource(detailsType));
      return res.status(200).json({
        status: true,
        data,
        message: `Details for parent with ID ${parentId} found`,
      });
    } catch (error) {
        next(error);
      }
  });

//add detailed type
router.post("/add", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const reqData = req.body;
        const { name, parent } = req.body;
        const { error } = detailedTypeRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let detailedType = await DetailedType.findOne({ name });
        if (detailedType) {
            return res.status(400).json({
                status: false,
                data: [],
                message: "Already exists"
            });
        }
        detailedType = new DetailedType({
            name,
            parent
        });
        await detailedType.save();
        const data = new DetailedTypeResource(detailedType);
        return res.status(201).json({
            status: true,
            data,
            message: "Created"
        });
    } catch (error) {
        next(error);
    }
});

//edit detailed type
router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const reqData = req.body;
        const {error} = detailedTypeRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let detailedType = await DetailedType.findById(id).populate("parent");
        if (!detailedType) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        detailedType = await DetailedType.findByIdAndUpdate(id, reqData, {new: true});
        const data = new DetailedTypeResource(detailsType);
        return res.status(200).json({
            status: true,
            data,
            message: "Updated"
        });
    } catch (error) {
        next(error);
      }
});

//delete detailed type
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const detailedType = await DetailedType.findById(id);
        if (!detailedType) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        await DetailedType.findByIdAndDelete(id);
        return res.status(200).json({
            status: true,
            data: [],
            message: "Deleted"
        });
    } catch (error) {
        next(error);
      }
});
export default router;
