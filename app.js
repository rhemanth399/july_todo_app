// let express=require('express')
// let clc=require('cli-color')
// let mongoose=require('mongoose')
// let bcrypt=require('bcrypt')
// let validator=require('validator')
// let session=require("express-session")
// let mongoDbSession=require("connect-mongodb-session")(session)


// let cleanUpAndValidate=require('./utils/AuthUtil')
// let userSchema=require('./userSchema')
// let isAuth =require("./utils/isAuth")

// let app=express()

// let PORT=process.env.PORT||8080
// let MONGO_URI='mongodb+srv://rhemanth:741628969@cluster0.hu6idae.mongodb.net/july_todo_app'

// app.set('view engine',"ejs")
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))
// let store=new mongoDbSession({
//     uri:MONGO_URI,
//     collection:'sessions',
// })

// app.use(session({
//     secret:"This is todo app",
//     resave:false,
//     saveUninitialized:false,
//     store:store,
// }))

// mongoose.connect(MONGO_URI)
// .then(()=>{
//     console.log(clc.green.bold.underline("MongoDb connect"))
// })
// .catch((error)=>{
//     console.log(clc.red.bold(error))
// })
// app.get('/',(req,res)=>{
//     res.send("Hello World")
// })

// app.get('/register',(req,res)=>{
//     return res.render("register")
// })
// app.post('/register',async(req,res)=>{
//     console.log(req.body)

   

//     const {name,email,password,username}=req.body
//     let passwordHash=await bcrypt.hash(password,11)
//     try{
//     await cleanUpAndValidate(name,email,username,password)
//     let user=new userSchema({
//         name:name,
//         email:email,
//         username:username,
//         password:passwordHash,
//     })
   
//     let checkEmailExist=await userSchema.findOne({email})
//     console.log(checkEmailExist)
//     if(checkEmailExist){
//         return res.send({
//             status:300,
//             message:'Email id exist already',
//         })
//     }

//     let checkUserExist=await userSchema.findOne({username})
//     if(checkUserExist)
//     {
//         return res.send({
//             status:350,
//             message:'Username is Exist',
//         })
//     }
//     try{
//         const userDb=await user.save()
//         return res.send({
//             status:200,
//             message:'User register successfull',
//             data:userDb,
//         })
//     }
//     catch(error){
//         return res.send({
//             status:400,
//             message:'User Error',
//             error:error
//         });
//     }
   
//     }
//     catch(error){
//             return res.send({
//                 status:400,
//                 message:'Data Invalid',
//                 error:error
//             })
//     }

   

// })

// app.get('/login',(req,res)=>{
//     return res.render('login')
// })

// app.post('/login',async(req,res)=>{
//     console.log(req.body)
//     let {loginId,password}=req.body
//     //data validation
//     try{
//     if(!loginId||!password)
//     {
//         return res.send({
//             status:400,
//             message:'Missing credentials'
//         })
//     }
//     if(typeof loginId!=='string'||typeof password!=='string')
//     {
//         return res.send({
//             status:400,
//             message:'Invalid Type'
//         })
//     }
// }
//     catch(error){
//         return res.send({
//             status:500,
//             message:'Internal Error'
//         })
//     }
//   // identify login and search in db
//   try{
//     let userDb
//         if(validator.isEmail(loginId))
//         {
//          userDb=await userSchema.findOne({email:loginId})
//            //console.log('it is email')

//         }
//         else{
//           userDb=await userSchema.findOne({username:loginId})
//             //console.log('it is username')
//         }
//         if(!userDb)
//         {
//             return res.send({
//                 status:400,
//                 message:'User not found'
//             })
//         }
//        // console.log(req.session)
//         let isMatch=await bcrypt.compare(password,userDb.password)
        
//         if(!isMatch)
//         {
//             return res.send({
//                 status:400,
//                 message:'Password doesnot match',
//             })
//         }
//         console.log(req.session)
//         req.session.isAuth=true;
//         return res.redirect('dashboard')
//     }
//     catch(error){
//         return({
//             status:500,
//             message:'data base error'
//         })
//     }
    
    
    
//     //return res.send(true)
// })

// app.get('/dashboard',(req,res)=>{
//     console.log(req.session)
//     res.render('dashboard')
    
// })

// app.post('/logout',isAuth,(req,res)=>{
//         req.session.destroy((err)=>{
//             if (err) {throw err};

//         })
//         return res.redirect('/login')
// })

// app.post('/logout_from_all_devices',async(req,res)=>{
//     const username=req.session.user.username
//     //create a session schema
//     const Schema=mongoose.Schema
//     const sessionSchema=new Schema(
//         {_id:String},
//         {strict:false}
//     )
//     const sessionModel=mongoose.model('session',sessionSchema)
//     try{
//         const deletionCount=await sessionModel.deleteMany({
//             "session.user.username":"username"

//         })
//         return res.send({
//             status:200,
//             message:"logout from all devices"
//         })
//     }
//     catch(error){
//         return res.send({
//             status:500,
//             message:'Logout failed',
//             error:error
//         })
//     }

// })

// app.listen(PORT,()=>{
//     console.log(`server is running on`)
//     console.log(clc.red.underline(`http:localhost ${PORT}`))
// })



const express = require("express");
const clc = require("cli-color");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

//file-imports
const { cleanUpAndValidate } = require("./utils/AuthUtils");
const userSchema = require("./userSchema");
const { isAuth } = require("./middlewares/AuthMiddleware");
const TodoModel = require("./models/TodoModel");
const { rateLimiting } = require("./middlewares/rateLimiting");

//variables
const app = express();
const PORT = process.env.PORT || 8080;
const saltRound = 11;
const MONGO_URI = `mongodb+srv://rhemanth:741628969@cluster0.hu6idae.mongodb.net/july_todo_app`;

app.set("view engine", "ejs");

//db Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(clc.green.bold.underline("MongoDb connected"));
  })
  .catch((err) => {
    console.log(clc.red.bold(err));
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const store = new mongoDbSession({
  uri: MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "This is Todo app, we dont love coding",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//routes
app.get("/", (req, res) => {
  return res.send("This is your Todo App");
});

app.get("/register", (req, res) => {
  return res.render("register");
});

app.get("/login", (req, res) => {
  return res.render("login");
});

//MVC

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password, username } = req.body;

  //data validation
  try {
    await cleanUpAndValidate({ name, email, password, username });

    //check if the user exits

    const userExistEmail = await userSchema.findOne({ email });

    console.log(userExistEmail);
    if (userExistEmail) {
      return res.send({
        status: 400,
        message: "Email Already exits",
      });
    }

    const userExistUsername = await userSchema.findOne({ username });

    if (userExistUsername) {
      return res.send({
        status: 400,
        message: "Username Already exits",
      });
    }

    //hash the password using bcypt
    const hashPassword = await bcrypt.hash(password, saltRound);

    const user = new userSchema({
      name: name,
      email: email,
      password: hashPassword,
      username: username,
    });

    try {
      const userDb = await user.save(); //create a user in DB
      console.log(userDb);
      return res.redirect("/login");
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Data Invalid",
      error: error,
    });
  }
});

app.post("/login", async (req, res) => {
  //validate the data
  console.log(req.body);
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "missing credentials",
    });
  }

  if (typeof loginId !== "string" || typeof password !== "string") {
    return res.send({
      status: 400,
      message: "Invalid data format",
    });
  }

  //identify the loginId and search in database

  try {
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await userSchema.findOne({ email: loginId });
    } else {
      userDb = await userSchema.findOne({ username: loginId });
    }

    if (!userDb) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
      });
    }

    //password compare bcrypt.compare
    const isMatch = await bcrypt.compare(password, userDb.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password Does not match",
      });
    }

    //Add session base auth sys
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.username,
      email: userDb.email,
      userId: userDb._id,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.get("/dashboard", isAuth, async (req, res) => {
  return res.render("dashboard");
});

//logout api's
app.post("/logout", isAuth, (req, res) => {
  console.log(req.session);
  req.session.destroy((err) => {
    if (err) throw err;

    return res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  const username = req.session.user.username;

  //create a session schema
  const Schema = mongoose.Schema;
  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const sessionModel = mongoose.model("session", sessionSchema);

  try {
    const deletionCount = await sessionModel.deleteMany({
      "session.user.username": username,
    });
    console.log(deletionCount);
    return res.send({
      status: 200,
      message: "Logout from all devices successfully",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Logout Failed",
      error: error,
    });
  }
});

//todo's api
app.post("/create-item", isAuth, rateLimiting, async (req, res) => {
  const todoText = req.body.todo;

  //data validation
  if (!todoText) {
    return res.send({
      status: 400,
      message: "Todo is Empty",
    });
  }

  if (typeof todoText !== "string") {
    return res.send({
      status: 400,
      message: "Invalid Todo format",
    });
  }

  if (todoText.length > 100) {
    return res.send({
      status: 400,
      message: "Todo is too long, should be less than 100 char.",
    });
  }

  //intialize todo schema and store it in Db
  const todo = new TodoModel({
    todo: todoText,
    username: req.session.user.username,
  });

  try {
    const todoDb = await todo.save();

    // console.log(todo);
    return res.send({
      status: 201,
      message: "Todo created successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/edit-item", isAuth, async (req, res) => {
  console.log(req.body);

  const { id, newData } = req.body;

  //data validation
  if (!id || !newData) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }
  if (typeof newData !== "string") {
    return res.send({
      status: 400,
      message: "Invalid Todo format",
    });
  }

  if (newData.length > 100) {
    return res.send({
      status: 400,
      message: "Todo is too long, should be less than 100 char.",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndUpdate(
      { _id: id },
      { todo: newData }
    );
    console.log(todoDb);

    return res.send({
      status: 200,
      message: "Todo updated Successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/delete-item", isAuth, async (req, res) => {
  console.log(req.body);

  const id = req.body.id;

  //data validation
  if (!id) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndDelete({ _id: id });
    console.log(todoDb);

    return res.send({
      status: 200,
      message: "Todo deleted Successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

// app.get("/read-item", async (req, res) => {
//   console.log(req.session.user.username);
//   const user_name = req.session.user.username;
//   try {
//     const todos = await TodoModel.find({ username: user_name });

//     if (todos.length === 0)
//       return res.send({
//         status: 400,
//         message: "Todo is empty, Please create some.",
//       });

//     return res.send({
//       status: 200,
//       message: "Read Success",
//       data: todos,
//     });
//   } catch (error) {
//     return res.send({
//       status: 500,
//       message: "Database error",
//       error: error,
//     });
//   }
// });

//pagination
//pagination_dashboard?skip=10
app.get("/pagination_dashboard", isAuth, async (req, res) => {
  const skip = req.query.skip || 0; //client
  const LIMIT = 5; //backend

  const user_name = req.session.user.username;

  try {
    const todos = await TodoModel.aggregate([
      //match, pagination
      { $match: { username: user_name } },
      {
        $facet: {
          data: [{ $skip: parseInt(skip) }, { $limit: LIMIT }],
        },
      },
    ]);

    // console.log(todos[0].data);
    return res.send({
      status: 200,
      message: "Read success",
      data: todos[0].data,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.listen(PORT, () => {
  console.log(clc.yellow.bold(`Server is running`));
  console.log(clc.yellow.bold.underline(`http://localhost:${PORT}`));
});

//create server and mongodb-connection
//Registeration Page
//register.ejs
//register a user in DB

//Login Page
//session base auth

//Dashbaord
//logout
//logout from all devices
//Todo's
//create a schema for todo
//create a todo
//edit a todo
//delete a todo
//show the todos on dashboard page

//Broswer.js
//axios
//read, edit and delete call from axios (client-side)

//pagination
//rate-limiting 2 hit / per second || 1 hit / 500 ms
//Deploy

//client(axios) ----REST API---> Server(Express routes) ---> Database (Mongodb)
//80 project 10 sql-10 nodejs