import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {

    try {

        // Get authorization header
        const authHeader = req.headers.authorization

        // Check token exists
        if (!authHeader) {

            return res.status(401).json({
                message: "Access denied. No token provided"
            })
        }

        // Remove Bearer from token
        const token = authHeader.split(" ")[1]

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        // Store user data in request
        req.user = decoded

        // Continue next function
        next()

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

export default authMiddleware