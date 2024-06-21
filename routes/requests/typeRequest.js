import Joi from "joi";

export const typeRequest = Joi.object({
    name: Joi.string().required()
});