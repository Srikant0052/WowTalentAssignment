const postModel = require("../models/postModel");
const aws = require("aws-sdk");
const { isValid, isValidRequestBody, isValidObjectId } = require('../utils/validator');
const userModel = require("../models/userModel");

//---------AWS S3..............................................................
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Minakshi/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            return resolve(data.Location)
        }
        )
    }
    )
}


//Create post
const createPost = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters.' });
        }

        let { title, text, user_id, postStatus } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' });
        }

        if (!isValid(text)) {
            return res.status(400).send({ status: false, message: 'text is required' });
        }

        if (!isValid(user_id)) {
            return res.status(400).send({ status: false, message: 'user_id is required' });
        }

        const user = await userModel.findOne({ user_id })

        //Post status validation
        if (!isValid(postStatus)) {
            return res.status(400).send({ status: false, message: 'Post Status is required' });
        }
        if (["Public", "Private"].indexOf(postStatus) === -1) {
            return res.status(400).send({ status: false, msg: "Post Status  will be either Public or Private!" });
        }

        //Authorization
        if(req.user !== user._id ){
            return res.status(403).send({status: false, message: 'You are not authorized'});
        }

        let file = req.files;
        if (!(file && file.length > 0)) {
            return res.status(400).send({ status: false, msg: "file is required" });
        }

        let url = await uploadFile(file[0]);
        const postData = {
            title: title,
            text: text,
            user_id,
            post: url,
            postStatus
        }

        const posttDetails = await postModel.create(postData);
        res.status(201).send({ status: true, message: "Success", data: posttDetails });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const updatePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const postData = req.body;
        const file = req.files;

        if (!isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: "please provide valid postId" });
        }
        if (!isValidRequestBody(postData)) {
            return res.status(400).send({ status: false, message: "Please provide post details to update" });
        }

        const ispostIdPresent = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!ispostIdPresent) {
            return res.status(404).send({ status: false, message: `User data not found with this Id ` });
        }

        let { title, text, postStatus } = postData;

          //Authorization
          if(req.user !== ispostIdPresent._id ){
            return res.status(403).send({status: false, message: 'You are not authorized'});
        }

        const updatePosttData = {};
        if ("title" in postData) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "title is required" })
            }
            if (!('$set' in updatePosttData)) {
                updatePosttData["$set"] = {};
            }
            updatePosttData['$set']['title'] = title
        }
        if ("text" in postData) {
            if (!isValid(text)) {
                return res.status(400).send({ status: false, message: "text is required" })
            }
            if (!('$set' in updatePosttData)) {
                updatePosttData["$set"] = {};
            }
            updatePosttData['$set']['text'] = text
        }
        if ("postStatus" in postData) {
            if (!isValid(postStatus)) {
                return res.status(400).send({ status: false, message: "postStatus is required" })
            }
            if (["Public", "Private"].indexOf(postStatus) === -1) {
                return res.status(400).send({ status: false, msg: "Post Status  will be either Public or Private!" });
            }
            
            if (!('$set' in updatePosttData)) {
                updatePosttData["$set"] = {};
            }
            updatePosttData['$set']['postStatus'] = postStatus
        }
       
        if (file && file.length > 0) {
            const url = await uploadFile(file[0])
            if (!('$set' in updatePosttData)) {
                updatePosttData["$set"] = {};
            }
            updatePosttData['$set']['post'] = url
        }
        const updatedData = await postModel.findOneAndUpdate({ _id: postId }, updatePosttData, { new: true })
            .select({ deletedAt: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        res.status(200).send({ status: true, message: "Product updated", data: updatedData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }

}

const deletePost = async  (req, res)=>{
    try {
        const postId = req.params.postId

        if (!isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: `Please enter a valid postId` })
        }
        const postFound = await postModel.findOne({ _id: postId, isDeleted: false })
        if (!postFound) {
            return res.status(404).send({ status: false, message: "Post not found" })
        }
        const postDeleted = await postModel.findOneAndUpdate({ _id: postId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: "Post deleted successfully" })
    } catch (err) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createPost, updatePost,deletePost}