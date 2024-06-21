import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import DetailsResource from '../resources/detailsResource.js';
import Details from '../models/details.js'
import { detailsRequest } from './requests/detailsRequest.js';
const router = express.Router();


// get details by id
router.get("/:id", async (req, res, next) => {
	try {
	  const id = req.params.id; 
	  const details = await Details.findById(id); 
	  
	  if (!details) {
		return res.status(404).json({
		  status: false,
		  data: null,
		  message: `Details with ID ${id} not found`,
		});
	  }
  
	  const data = new DetailsResource(details); 
	  return res.status(200).json({
		status: true,
		data,
		message: `Details with ID ${id} found`, 
	  });
	} catch (error) {
        next(error); 
      }
  });
  
// add details
router.post("/add", authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const reqData = req.body;
        const {       buildingYear, 
                      roomAndSaloon, 
		              floor, locatedFloor, 
			          bathroom, internet, 
			          furnished, balcony, 
			          elevator, thermalInsulation,
		              garage, fittedKitchen, 
			          fittedBathroom,
                      parquet, heatingType } = req.body;
        const {error} = detailsRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let details = await Details.findOne({buildingYear});
        if (details) {
            return res.status(400).json({
                status: false,
                data: [],
                message: "Already exsist"
            });
        }
        details = new Details({
                             buildingYear, roomAndSaloon, 
		                     floor, locatedFloor, 
			                 bathroom, internet, 
			                 furnished, balcony, 
			                 elevator, thermalInsulation,
		                     garage, fittedKitchen, 
			                 fittedBathroom, parquet, heatingType
        });
        await details.save();
        const data = new DetailsResource(details);
        return res.status(201).json({
            status: true,
            data,
            message: "Created"
        });
    } catch (error) {
        next(error); 
      }
});

//edit details by id
router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const reqData = req.body;
        const {error} = detailsRequest.validate(reqData);
        if (error) {
            return res.status(400).json({
                status: false,
                data: [],
                message: error.message
            });
        }
        let details = await Details.findById(id);
        if (!details) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Not found"
            });
        }
        details = await Details.findByIdAndUpdate(id, reqData, {new: true});
        const data = new DetailsResource(details);
        return res.status(200).json({
            status: true,
            data,
            message: "Updated"
        });
    } catch (error) {
        next(error); 
      }
});
export default router