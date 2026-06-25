import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is missing. Add it to CRM/Server/.env, for example: DATABASE_URL=\"mysql://root:@localhost:3306/crm_db\""
    )
}

const prisma = new PrismaClient()

export default prisma
