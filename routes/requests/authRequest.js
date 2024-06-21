import Joi from "joi";

export const loginRequest = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(4).required()
});
export const registerRequest = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    password_confirmation: Joi.ref('password')
});