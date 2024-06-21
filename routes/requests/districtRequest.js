import Joi from "joi";

export const districtRequest = Joi.object({
    name: Joi.string().required(),
    province: Joi.string().required()
});