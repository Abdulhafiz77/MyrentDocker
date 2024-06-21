import Joi from "joi";

export const provinceRequest = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required()
});