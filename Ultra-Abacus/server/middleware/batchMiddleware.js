import {validationResult} from "express-validator";

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.length > 0) {
        return res.status(400).json({
            errors: errors
        });
    }
    next();
};    