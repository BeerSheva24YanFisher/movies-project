import Joi from "joi";
import { id } from "./commonFields.js";

const currentYear = new Date().getFullYear();

const imdbId = Joi.number();
const rating = Joi.number().integer().greater(0).less(11);
const actor = Joi.string().regex(/^[A-Za-z ]+$/);
const amount = Joi.number().min(1).max(20);
const genres = Joi.array().items(Joi.string());
const languages = Joi.array().items(Joi.string());
const year = Joi.number().min(1900).max(currentYear);

export const schemaId = Joi.object({
    id: id.required()
});
export const schemaFilter = Joi.object({
    year,
    actor,
    genres,
    languages,
    amount: amount.required()
});
export const schemaRating = Joi.object({
    imdbId: imdbId.required(),
    rating: rating.required()
});