import Joi from "joi";

export const userUpdateDataRequest = Joi.object({
    image: Joi.string(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
});
export const userUpdatePasswordRequest = Joi.object({
    old_password: Joi.string().min(4).required(),
    password: Joi.string().min(4).required(),
    password_confirmation: Joi.ref('password')
});
export const userDestroyRequest = Joi.object({
    password: Joi.string().min(4).required()
});
export const userRoleRequest = Joi.object({
    role: Joi.string().valid('banned', 'admin', 'user').required()
});