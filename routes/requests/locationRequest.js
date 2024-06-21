import Joi from "joi";

export const locationRequest = Joi.object({
    province: Joi.string().required(),
    district: Joi.string().required(),
    address: Joi.string().required()
});