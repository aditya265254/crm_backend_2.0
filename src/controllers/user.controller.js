const { USERTYPES, USER_STATUS } = require("../constants");
const User = require("../models/user.model");

async function getAllUsers(req, res) {
    try {
        const queryObj = {};
        if ([USERTYPES.ENGINEER, USERTYPES.CUSTOMER, USERTYPES.ADMIN].includes(req.query.userType)) {
            queryObj.userType = req.query.userType;
        }
        if ([USER_STATUS.PENDING, USER_STATUS.APPROVED].includes(req.query.userStatus)) {
            queryObj.userStatus = req.query.userStatus;
        }
        const users = await User.find(queryObj).select("name email userId userStatus userType");
        res.status(200).send(users);
    } catch (ex) {
        res.status(500).send({
            message: `Error fetching users: ${ex.message}`,
        });
    }
}

async function getUserByUserId(req, res) {
    const userId = req.params.userId;
    try {
        const user = await User.findOne({ userId: userId }).select("-password");
        if (!user) {
            return res.status(404).send({
                message: `User with userId ${userId} does not exist`,
            });
        }
        res.status(200).send(user);
    } catch (ex) {
        res.status(404).send({
            message: `User with userId ${userId} does not exist`,
        });
    }
}

async function updateUserDetails(req, res) {
    const userId = req.params.userId;
    try {
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.userType) updateData.userType = req.body.userType;
        if (req.body.userStatus) updateData.userStatus = req.body.userStatus;
        updateData.updatedAt = Date.now();

        const user = await User.findOneAndUpdate(
            { userId: userId },
            updateData,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).send({
                message: `User with userId ${userId} does not exist`,
            });
        }

        res.status(200).send(user);
    } catch (ex) {
        res.status(500).send({
            message: `Error updating user: ${ex.message}`,
        });
    }
}

module.exports = {
    getAllUsers,
    getUserByUserId,
    updateUserDetails,
};
