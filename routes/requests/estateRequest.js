import Joi from "joi";

export const estateRequest = Joi.object({
    images: Joi.array(),
    status: Joi.bool(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(100).required(),
    size: Joi.number().min(1).required(),
    category: Joi.string().valid('rent', 'sale').required(),
    type: Joi.string().required(),
    detailedType: Joi.string().required(),
    details: Joi.string().required(),
    location: Joi.string().required()
});