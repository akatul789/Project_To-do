const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const port = 8000;

const sequelize = new Sequelize({
	username: "aks1",
    password: 'aks101',
	database: "postgres",
    host: "localhost",
    dialect: "postgres"
});

sequelize.authenticate()
.then( ()=> {
    console.log("Database Connected");
}).catch( err => {
    console.error('unable to connect to Database');
});

// 		## Creating Tables--
///// User table----------------
const User = sequelize.define('userdata',{

    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    uname: Sequelize.STRING,

    uemail: {
        type: Sequelize.STRING,
        unique: true,
            validate: {
                isEmail: true
            }
            },
    prof_pic: Sequelize.STRING
    
    },{
        timestamps: false
});
//  To-do table---------------------
const To_do = sequelize.define('to_do',
{

    tid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    //~ user_id: {
    //~ type: Sequelize.INTEGER,
    //~ allowNull: false
    //~ },
	status : {
	type: Sequelize.BOOLEAN,
	defaultValue: false
    },
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
    {
        timestamps: false
});

// Login Table---------------------

const Login = sequelize.define('login',
{

    log_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING,
    	allowNull: false,
    },
	password: Sequelize.STRING
    },{
        timestamps: false
});

Login.belongsTo(User, { onDelete: 'cascade', foreignKey: 'email', targetKey: 'uemail'}); // 1-1 rel. from login to user

//~ { onDelete: 'cascade', foreignKey: { allowNull: false }  hooks: true});

User.hasMany(To_do,{foreignKey:'user_id'}); /// one to many rel.

//===================

 //~ sequelize.sync({
     //~ force: true
 //~ });
 
//========================= 
 
 
//======
// authHandler function---

var authHandler = function (req, res, next) {
    
    if(!req.get("X-AUTH-TOKEN"))
    {
        res.status(500).json({
            success: false,
            error: {
                message: "token not passed"
            }
        });
        return;
    }

    try{
        var token = req.get("X-AUTH-TOKEN");

        var user_credentials = jwt.verify(token, 'shhhhh');

    }
    catch(err){
        console.log(err);
        res.status(401).json({
            success: false,
            error: {
                message: "Invalid Token"
            }
        });
        return;
    }
    next();
}

 
 
//-------testing api

app.get('/' ,  (req,res) => {

    res.status(200).json({
        success: true,
        message: "Welcome to TODO APIS"
    });
    return;

});


//--------------- Create user api -----------------------

app.post('/create/user', async (req,res) => {

    var emailz = req.body.emailid;
    var username = req.body.username;
	var pass=req.body.password;
	
    var newUser = {
        uname: username,
        uemail: emailz
    }
    
	var logindet = {
        email: emailz,
        password: pass
    }

   try{
       
        var user_created = await User.create(newUser);
        
        var login=await Login.create(logindet);
		
        console.log(user_created);
        
        if(user_created)
        {
            res.status(200).json({
                message: "User created successfully !!"
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "User not created !!",
        error: err
    });
    return;
   }

})

//---------------------- Create TO-do api --------------------

app.post('/create/todo', async (req,res) => {

    var tit = req.body.title;
    var des = req.body.des;
    var uid = req.body.userid;

    var newtodo = {
		title: tit,
		description: des,
		user_id:uid
    }

   try{
       
        var todo_created = await To_do.create(newtodo);

        console.log(todo_created);
        
        if(todo_created)
        {
            res.status(200).json({
                message: "TO-Do created successfully !!"
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "TO-Do not created !!",
        error: err
    });
    return;
   }

})

//------------------------ Dashboard api----------------------
app.get('/get/dashboard', async (req,res) => {

    var uid = req.query.userid;

    try{

        var todos = await To_do.findAll({
            where: {
                user_id: uid
            }
        });

        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//------------------------ Delete todo api----------------------
app.get('/get/delete_todo', async (req,res) => {

    var tid1 = req.query.todoid;

    try{

        var todos = await To_do.update(
					{
					  deleted:true
					},
					{ where: { tid: tid1 } }
        );

        if(todos)
        {
            res.status(200).json({
                message: "TO-Do Deleted successfully !!"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//-----------------------Edit todo api-----------------------

app.get('/get/edit_todo', async (req,res) => {
	
    var tid1 = req.query.todoid;
    var tit = req.query.title;
    var des = req.query.des;
    var comp = req.query.completed;
    var del = req.query.deleted;

    var newtodo = {
		title: tit,
		description: des,
		status:comp,
		deleted:del
    }

    try{

        var todos = await To_do.update(newtodo,
					{ where: { tid: tid1 } }
        );

        if(todos)
        {
            res.status(200).json({
                message: "TO-Do Updated successfully !!"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//------------------------ Deleted todos Dashboard api----------------------
app.get('/get/deleted_dashboard', async (req,res) => {

    var uid = req.query.userid;

    try{

        var todos = await To_do.findAll({
            where: {
                user_id: uid,
                deleted: true
            }
        });

        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//------------------------ Profile details api----------------------
app.get('/get/profile_details', async (req,res) => {

    var uid = req.query.userid;

    try{

        var user = await User.findOne({
            where: {
                user_id: uid
            }
        });

        if(user)
        {
            res.status(200).json({
                user_details : user
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})


//----------------------Login Api---------------------

app.post('/login', async function(req,res) {

		var emailz = req.body.emailid;
		var pass = req.body.password;
    try{

        var login_det = await Login.findOne({
            where: {
                email: emailz,
                password:pass
            }
        });
		console.log(login_det);
        if(login_det)
        {
            var token = jwt.sign(login_det.dataValues, 'shhhh', { algorithm: 'RS256'});
            res.status(200).json({
                success: true,
                token: token
            });
            return;
        }
        else{
            res.status(500).json({
                success: false,
                error: `Cannot find your account`
            });
            return;
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err.message} `
        });
        return;
    }

})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

