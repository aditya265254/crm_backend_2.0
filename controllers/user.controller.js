const { USERTYPES, USER_STATUS } = require("../constant");
const User = require("../models/user.model");


async function getAllUsers(req, res) {
    const queryObj = {};
    if([USERTYPES.ENGINEER, USERTYPES.CUSTOMER, USERTYPES.ADMIN].includes(req.query.userType)) {
      queryObj.userType = req.query.userType;
    }
    if ([USER_STATUS.PENDING, USER_STATUS.APPROVED].includes(req.query.userStatus)) {
      queryObj.userStatus = req.query.userStatus;
    }
    const users = await User.find(queryObj).select(
      "name email userId userStatus userType"
    );
    res.status(200).send(users);
  }


  async function getUserByUserId(req, res) {
    const userId = req.params.userId; 
    try {
    const user = await User.findById(userId).select("-password");
    if(user === null) {
      req.status(404).send({
        messagage:`User with userId ${userId} does not exist`,
      })
      return;
    }
    res.status(200).send(user);
  } catch(ex) { 
    req.status(404).send({
      messagage:`User with userId ${userId} does not exist`,
    })
  }
}

async function updateUserDetails(req, res) {
  const userId = req.params.userId; 
  try {
  const user = await User.findByIdAndUpdate(userId, {
    userType: req.body.userType,
    userStatus: req.body.userStatus,
    name: req.body.name,
  });
 
  res.status(200).send(user);
} catch (ex) { 
  req.status(404).send({
    messagage:`User with userId ${userId} does not exist`,
  })
}
}

module.exports = {
    getAllUsers,
    getUserByUserId,
    updateUserDetails
}