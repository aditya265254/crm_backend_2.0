const { getAllUsers, getUserByUserId, updateUserDetails } = require("../controllers/user.controller");
const { verifyJwtToken, isAdmin } = require("../middlewares/verifyJwt");

module.exports = function (app) {
    app.get("/crm/api/v1/users", [verifyJwtToken, isAdmin], getAllUsers);
    app.get("/crm/api/v1/users/:userId", [verifyJwtToken], getUserByUserId);
    app.put("/crm/api/v1/users/:userId", [verifyJwtToken], updateUserDetails);
};
