const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isValid, isValidRequestBody } = require('../utils/validator');
const saltRounds = 10;
const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const mobileRegex = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;

// user registration 
const userRegistration = async (req, res) => {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }

        //Destructuring the request body
        const { name, email_id, password, user_name, gender, mobile, profile } = requestBody;

        // Basic user validations
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required" });
        }

        //user_id increses every time when a user registered
        const user = await userModel.find()
        let user_id = user.length + 1


        //Email validation
        if (!isValid(email_id)) {
            return res.status(400).send({ status: false, message: "email_id is required" });
        }
        if (!emailRegex.test(email_id)) {
            return res.status(400).send({ status: false, message: "email_id should be a valid email_id" });
        }
        const isemailExist = await userModel.findOne({ email_id });
        if (isemailExist) {
            return res.status(400).send({ status: false, message: "email_id already registered" });
        }

        //Password validation
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' });
        }
        // Password validation like upperCase, lowerCase , minLength, maxLength, Special character
        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: 'password should be valid password' });
        }
        //hashing password using bcrypt
        const hashPassword = bcrypt.hashSync(password, saltRounds);

        //user_name validation
        if (!isValid(user_name)) {
            return res.status(400).send({ status: false, message: "user_name is required" });
        }
        const isUser_nameExists = await userModel.findOne({ user_name });
        if (isUser_nameExists) {
            return res.status(400).send({ status: false, message: "user_name already registered" });
        }

        //gender validation
        if (!isValid(gender)) {
            return res.status(400).send({ status: false, message: "gender is required" });
        }
        if (["Male", "Female", "Other"].indexOf(gender) === -1) {
            return res.status(400).send({ status: false, msg: "Please  enter a vaild gender" });
        }

        //Mobile Number validations
        if (!isValid(mobile)) {
            return res.status(400).send({ status: false, message: "Mobile Number is required" });
        }
        if (!mobileRegex.test(mobile)) {
            return res.status(400).send({ status: false, message: "Mobile Number should be a valid Number" });
        }
        const isMobileExists = await userModel.findOne({ user_name });
        if (isMobileExists) {
            return res.status(400).send({ status: false, message: "Mobile Number already registered" });
        }

        //Profile validation
        if (!isValid(profile)) {
            return res.status(400).send({ status: false, message: "profile is required" });
        }
        if (["Public", "Private"].indexOf(profile) === -1) {
            return res.status(400).send({ status: false, msg: "Profile  will be either Public or Private!" });
        }

        //create a object 
        const userData = {
            name: name, user_id: user_id, email_id: email_id, password: hashPassword, mobile: mobile, user_name: user_name, gender: gender, mobile: mobile, profile: profile
        };
        const userCreated = await userModel.create(userData);
        return res.status(201).send({ status: true, message: 'User created successfully', data: userCreated });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//User login
const userLogin = async (req, res) => {
    try {
        // Basic user validation
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        const { email_id, password } = requestBody;
        if (!isValid(email_id)) {
            return res.status(400).send({ status: false, message: "email_id is required" });
        }
        if (!emailRegex.test(email_id)) {
            return res.status(400).send({ status: false, message: "email_id should be a valid email_id" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' });
        }

        // fetching user data using email_id
        const user = await userModel.findOne({ email_id });
        if (!user) {
            return res.status(404).send({ status: false, message: "User doesn't exists. Please register first" });
        }

        // comparing password of DB and getting from user
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).send({ status: false, message: "Password not matched" });
        }

        // Creating jwt token and save it on cookie
        const token = jwt.sign({
            userId: user._id
        }, 'abc123', { expiresIn: '1h' });
        res.cookie(`accessToken`, token);

        return res.status(200).send({ status: true, message: "Success" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { userRegistration, userLogin, }