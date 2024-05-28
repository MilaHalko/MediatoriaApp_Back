import {body} from "express-validator";
import {VALIDATION_PARAMS} from "../config/constants.js";
const {text, rating} = VALIDATION_PARAMS.review

export const reviewValidation = [
    body('text', 'Content must be at least 3 characters long').isLength({min: text.minLength}).isString(),
    body('rating', 'Rating must be between 1 and 10').isInt({min: rating.min, max: rating.max}),
]