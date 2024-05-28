import {body} from "express-validator";

export const reviewValidation = [
    body('text', 'Content must be at least 10 characters long').isLength({min: 10}).isString(),
    body('rating', 'Rating must be between 1 and 10').isInt({min: 1, max: 10}),
]