import {body} from "express-validator";
import {isImage} from "../utils/index.js";
import {VALIDATION_PARAMS} from "../config/constants.js";
const {username, password} = VALIDATION_PARAMS

const errorTexts = {
    'username': `Username must be between ${username.minLength} and ${username.maxLength} characters`,
    'email': 'Invalid email',
    'password': `Password must be between ${password.minLength} and ${password.maxLength} characters`,
    'avatarUrl': 'Invalid URL'
}

export const signupValidations = [
    body('username', errorTexts.username).isLength({min: username.minLength, max: username.maxLength}),
    body('email', errorTexts).isEmail(),
    body('password', errorTexts.password).isLength({min: password.minLength, max: password.maxLength}),
    body('avatarUrl', errorTexts.avatarUrl).optional().isURL().custom(isImage),
]

export const updateValidations = [
    body('username', errorTexts.username).optional().isLength({min: username.minLength, max: username.maxLength}),
    body('password', errorTexts.password).optional().isLength({min: password.minLength, max: password.maxLength}),
    body('avatarUrl', errorTexts.avatarUrl).optional().isURL().custom(isImage),
]