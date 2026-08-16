const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../configs/auth.config");
const { USERTYPES } = require("../constants");

function verifyJwtToken(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) {
        return res.status(401).send({ message: "Token is not present" });
    }

    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: "Unauthenticated user or invalid token" });
        } else {
            req.userId = decoded.userId;
            req.userType = decoded.userType;
            next();
        }
    });
}

function isAdmin(req, res, next) {
    const userType = req.userType;
    if (userType === USERTYPES.ADMIN) {
        next();
    } else {
        return res.status(403).send({ message: "Only admins can perform this action" });
    }
}

module.exports = {
    verifyJwtToken,
    isAdmin,
};
