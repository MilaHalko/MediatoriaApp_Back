import {validationResult} from "express-validator";

export const handleValidationErrors = (req, res, next) => {
    console.log('Validating request...')
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log('Error:', errors.array())
        return res.status(400).json({
            message: errors.array()[0].msg.toString()
        })
    }

    next()
}