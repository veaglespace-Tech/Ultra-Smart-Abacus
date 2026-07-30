import jwt from "jsonwebtoken"

const generateToken = (user, franchiseId = null) => {

    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            email: user.email,
            franchiseId: user.franchiseId || franchiseId || null
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    )
}

export default generateToken