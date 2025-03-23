import Joi from "joi";

export const email = Joi.string().email();
export const id = Joi.string().hex().length(24);
export const text = Joi.string().min(3);