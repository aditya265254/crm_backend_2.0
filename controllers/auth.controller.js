const User = require("../models/user.model");
const bcrypt = require ("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../configs/auth.config");
const { USERTYPES, USER_STATUS } = require("../constant");



function signup(req, res ) {
    const { name, email, userId, password, userType } = req.body;
    const userObj = {
      name,
      email,
      userId,
  // you have to send password in bcrypt from use bcrypt.hashSync(password,10) 10 is salt or round 
  // these number can  help the store the pas in hash from 
      password: bcrypt.hashSync(password,10),
      userType,
      // if user is costmer then approved or the user is admin then send in pending  
      userStatus: userType === USERTYPES.CUSTOMER ? USER_STATUS.APPROVED :USER_STATUS.PENDING,
    } 
    User.create(userObj)
    .then((data) => {
      res.status(200).send({
        // we don't want to send the password so use create a function we canm assign indiuswaly fild to send the data 
        // like name: data.name, and every field which one we have to send assign it 
        id: data._id,
        name: data.name,
        email: data.email,
        userId: data.userId,
        userType: data.userType,
        userStatus: data.userStatus
      }) 
    })
    .catch((err) => res.status(400).send(err));
  }



  async function signin(req, res) {
    const { userId, password } = req.body;
    // this is use to check the user is exist on the data base or not if we do await here we use to async function
    const user = await User.findOne({ userId : userId });
    // if data is not present in mongoose return null 
     // so we can modify this to message 
    if (user === null) {
     res.status(401).send({
       message: "Failded! userId does not exist",
     });
     return;
    }
    //  if user can signin and status is not approved the user should not allow to signin  
   
    if (user.userStatus !== USER_STATUS.APPROVED){
     res.status(401).send({
       message: "Cannot login as user is not approved yet",
     }); 
     return;
    }
   
    // if user can come here then the user is valid and user status is approved
   
    // so here we will check the password is valid or not 
    /* Here we have two password db password is in hash from   and when we are calling api in we alo send a password
    so we have two password to compare i is from data base second is from login page 
   */  
   // what the different between compare and compareSynce
   //comparesync these does not return a promise these are syncronus function  
   // if we use compare this is a symcronus function in this we use .then to figure out the data  
   // compare is better then comparesync if this function takes time you use compareSync the javascript exeucation has blocked at this point
   // but we want the execution to block  
   // we use bcrypt.compareSync() 
   
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
     res.status(401).send({
       message: "Password is invalid",
     }); 
     return;
   }
     // if i reach at this point the user is valid  if user can rech this we need to generate the jwt token 
     // sign work to create the jwt token & then we put palod we put id in palod , uesrType , email;
    const accessToken = jwt.sign ({
     userId: user.userId,
     userType: user.userType,
     email: user.email,
     // the next parem we have to use a secret key 
   },
   // here we import the SECRET key
   SECRET_KEY,
   {
     // we can ad here expiry timing in seconds and hours 
     expiresIn: 1200,
   });
   // if allis done we send in  this 
   res.status(200).send({
     name: user.name,
     userStatus: user.userStatus,
     // imp thing we have to send acess token 
     accessToken,
   
   });
   
   } 

   module.exports = {
    signup,
    signin,
   }; 