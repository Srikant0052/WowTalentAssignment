const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    text: {
        type: String,
        trim: true,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: Number,
        ref: 'User',
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    post: {
        type: String
    },
    postStatus: {
        type: String,
        required: true,
        enum: ["Public", "Private"]
    },
    likes: [{
        type: String
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }

},
    { timestamps: true });
module.exports = mongoose.model('Post', postSchema);