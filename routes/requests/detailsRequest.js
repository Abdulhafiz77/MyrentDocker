import Joi from "joi";

export const detailsRequest = Joi.object({
    buildingYear: Joi.number().required(),
    roomAndSaloon: Joi.string().required(),
    floor: Joi.number().required(),
    locatedFloor: Joi.number().required(),
    bathroom: Joi.number().required(),
    internet: Joi.boolean().required(),
    furnished: Joi.boolean().required(),
    balcony: Joi.boolean().required(),
    elevator: Joi.boolean().required(),
    thermalInsulation: Joi.boolean().required(),
    garage: Joi.boolean().required(),
    fittedKitchen: Joi.boolean().required(),
    fittedBathroom: Joi.boolean().required(),
    parquet: Joi.boolean().required(),
    heatingType: Joi.string().required()
});
