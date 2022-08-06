const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: Number,
        required: true,
        unique: true,
    },
    email_id: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
    },
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    profile: {
        type: String,
        required: true,
        enum: ["Public", "Private"],
    },
    follower:{
        type: String,
        default:[]
    }

},
    { timestamps: true });
module.exports = mongoose.model('User', userSchema);