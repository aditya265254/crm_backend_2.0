const { signup, signin } = require("../controllers/auth.controller");

module.exports = function (app) {
    app.post("/crm/api/v1/auth/signup",signup);
    app.post ("/crm/api/v1/auth/signin",signin );
}; 