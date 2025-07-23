import { trusted } from "mongoose";
import mongoose from mongoose;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    email: {
        String,
        required: true,
        index: { unique: true }
    },
    password: {
        String,
        required: true
    },
    avatar: {
        String
    }
},
{
    timestamps: true
});

export default mongoose.model('User', userSchema);