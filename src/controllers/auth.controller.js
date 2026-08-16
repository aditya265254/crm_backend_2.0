const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../configs/auth.config");
const { USERTYPES, USER_STATUS } = require("../constants");

async function signup(req, res) {
    try {
        const { name, email, userId, password, userType } = req.body;
        const userObj = {
            name,
            email,
            userId,
            password: bcrypt.hashSync(password, 10),
            userType,
            userStatus: userType === USERTYPES.CUSTOMER ? USER_STATUS.APPROVED : USER_STATUS.PENDING,
        };
        const data = await User.create(userObj);
        res.status(201).send({
            id: data._id,
            name: data.name,
            email: data.email,
            userId: data.userId,
            userType: data.userType,
            userStatus: data.userStatus,
        });
    } catch (err) {
        res.status(400).send({
            message: err.message || "Error occurred while creating user",
        });
    }
}

async function signin(req, res) {
    try {
        const { userId, password } = req.body;
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(401).send({
                message: "Failed! userId does not exist",
            });
        }

        if (user.userStatus !== USER_STATUS.APPROVED) {
            return res.status(401).send({
                message: "Cannot login as user status is not APPROVED yet",
            });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({
                message: "Invalid password",
            });
        }

        const accessToken = jwt.sign(
            {
                userId: user.userId,
                userType: user.userType,
                email: user.email,
            },
            SECRET_KEY,
            {
                expiresIn: "2h",
            }
        );

        res.status(200).send({
            name: user.name,
            userId: user.userId,
            email: user.email,
            userType: user.userType,
            userStatus: user.userStatus,
            accessToken,
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Internal server error during login",
        });
    }
}

module.exports = {
    signup,
    signin,
};
