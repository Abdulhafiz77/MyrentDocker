import Joi from "joi";

export const detailedTypeRequest = Joi.object({
    name: Joi.string().required(),
    parent: Joi.string().required()
});