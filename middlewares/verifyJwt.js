const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../configs/auth.config");


function isAdmin(req, res, next) {
const token = req.headers["x-access-token"];
// IN this token we need to check the  user is admin  
if(!token) {
    // If the token is not present 
    res.status(403).send("Token is not present");
}

jwt.verify(token, SECRET_KEY, function (err, decoded) {
    if (err) {
        res.status(403).send("Invalid token");
    } else if (decoded.userType === "ADMIN") {
        next();
    } else {
        res.status(403).send("onlyadmins can call the API");
    }
});
// now we need to verify the token is present or not 
// first we need to require jwt token 

 }

 function verifyJwtToken(req, res, next){
    const token = req.headers["x-access-token"];
if(!token) {
    res.status(401).send("Token is not present");
}

jwt.verify(token, SECRET_KEY, function (err, decoded) {
    if (err) {
        res.status(401).send("Unauthenticated user");
    } else {
        req.userId = decoded.userId;
        req.userType = decoded.userType;
        next()
    }
});
 }
 module.exports = {
     isAdmin,
     verifyJwtToken,
 };