import { validationResult } from "express-validator";

export const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,
            errors: errors.array()

        });

    }

    const { recipientType, batchId, studentId } = req.body;

    if (recipientType === "BATCH" && !batchId) {

        return res.status(400).json({

            success: false,
            message: "batchId is required for BATCH notification"

        });

    }

    if (recipientType === "STUDENT" && !studentId) {

        return res.status(400).json({

            success: false,
            message: "studentId is required for STUDENT notification"

        });

    }

    next();

};