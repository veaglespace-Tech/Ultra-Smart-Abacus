import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/authRoutes.js"

 import errorMiddleware from "./middleware/errorMiddleware.js"
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(` Server running at: http://localhost:${PORT}`)
})