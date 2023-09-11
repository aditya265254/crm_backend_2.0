const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const { DB_URL, DB_NAME } = require("./configs/db.config");
const { PORT } = require("./configs/server.config");
const app = express();


app.use(bodyParser.json());
   
mongoose
.connect(`${DB_URL}`)
.then(() => console.log("Connected to mongo db data base sucess fully"))
.catch((ex) => console.log("Not connected to mongo db data base ", ex));
  
require("./routs/auth.routes") (app);
require("./routs/user.routs") (app); 
require("./routs/ticket.routs") (app); 


 
app.listen(PORT);    
