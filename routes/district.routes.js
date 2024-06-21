import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'; 
import adminMiddleware from '../middleware/adminMiddleware.js';
import District from '../models/district.js'
import DistrictResource from '../resources/districtResource.js';
import { districtRequest } from './requests/districtRequest.js'
const router = express.Router();

// get district by ID
router.get("/:id", async (req, res, next) => {
	try {
	  const id = req.params.id; 
	  const district = await District.findById(id).populate("province"); 
	  
	  if (!district) {
		return res.status(404).json({
		  status: false,
		  data: null,
		  message: `District with ID ${id} not found`,
		});
	  }
  
	  const data = new DistrictResource(district); 
	  return res.status(200).json({
		status: true,
		data,
		message: `District with ID ${id} found`, 
	  });
	} catch (error) {
        next(error); 
      }
  });


// get all distructs
router.get('/', async (req, res, next) => {
    try {
        const district = await District.find({}).populate(["province"]);
        return res.send({
            message: 'District got successfully',
            data: district,
            success: true,
        });
    } catch (error) {
       next(error);
    }
});

// get districts by province
router.get("province/:provinceId",  async (req, res, next) => {
    try {
      const provinceId = req.params.provinceId;
      const districts = await District.find({ province: provinceId });
  
      if (!districts.length) {
        return res.status(404).json({
          status: false,
          message: `No districts found for province with ID ${provinceId}`,
        });
      }
      const data = districts.map(district => new DistrictResource(district));
      return res.status(200).json({
        status: true,
        data,
        message: `Districts for province with ID ${provinceId} found`,
      });
    } catch (error) {
        next(error); 
      }
  });

// add district
router.post("/add", authMiddleware, async (req, res, next) => {
    try {
        const reqData = req.body;
        const {name, province} = req.body;
        const {error} = districtRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let district = await District.findOne({name});
        if (district) {
            return res.status(400).json({
                status: false,
                data: [],
                message: "Already exsist"
            });
        }
        district = new District({
            name, province
        });
        await district.save();
        const data = new DistrictResource(district);
        return res.status(201).json({
            status: true,
            data,
            message: "Created"
        });
    } catch (error) {
        next(error); 
      }
});
//edit district by id
router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const reqData = req.body;
        const {error} = districtRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let district = await District.findById(id).populate("province");
        if (!district) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        district = await District.findByIdAndUpdate(id, reqData, {new: true});
        const data = new DistrictResource(district);
        return res.status(200).json({
            status: true,
            data,
            message: "Updated"
        });
    } catch (error) {
        next(error); 
      }
});

//delete district by id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const districts = await District.findById(id);
        if (!districts) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        await District.findByIdAndDelete(id);
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