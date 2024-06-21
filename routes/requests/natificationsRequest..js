import Joi from "joi";

export const notificationsRequest = Joi.object({
    message: Joi.string().required(),
    user: Joi.string().required(),
    estate: Joi.string().required(),
    status: Joi.boolean().default(true)
});