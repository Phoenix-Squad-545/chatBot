import mongoose from "mongoose"
import { USERS_CL } from "../../constants/schemaName"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    acceptTerms: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export const User = mongoose.model(USERS_CL, userSchema)