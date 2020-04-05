const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.options('*', cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // cors header
    if(req.method == "OPTIONS"){
            // In very simple terms, this is how you handle OPTIONS request in nodejs
            res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, HEAD");
            res.header('Access-Control-Max-Age', '1728000');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization, X-AUTH-TOKEN");
            res.header("Content-Length", "0");
            res.sendStatus(208);
    }
    else{
        next();
    }
});

//=====================================================
// Server Database Config

//const sequelize = new Sequelize({
//    username: "postgres",
//    password: 'Admin123',
//    database: "todo",
//    host: "localhost",
//    dialect: "postgres"
//});

// Surya Database Config

// const sequelize = new Sequelize({
// 	username: "postgres",
//     password: 'surya@1999',
// 	database: "surya",
//     host: "localhost",
//     dialect: "postgres"
// });

// Atul Database Config

 const sequelize = new Sequelize({
	 username: "aks1",
	 password: 'aks101',
	 database: "todo",
	 host: "localhost",
	 dialect: "postgres"
 });

//======================================================

const port = 8000;

sequelize.authenticate()
    .then(() => {
        console.log("Database Connected");
    }).catch(err => {
        console.error('unable to connect to Database');
    });

// !!-Creating Tables

// User table-----------------------------

const User = sequelize.define('userdata', {

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

}, {
    timestamps: false
});

//  To-do table-----------------------

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
        status: {
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
        }
    }, {
    timestamps: false
});

// !!-Relations

Login.belongsTo(User, { onDelete: 'cascade', foreignKey: 'email', targetKey: 'uemail' });
User.hasMany(To_do, { foreignKey: 'user_id' });


//=============================

//  sequelize.sync({
//     force: true
//  });

//=============================


// !!--------------authHandler Middleware function----------------------

var authHandler = function (req, res, next) {

    if (!req.get("X-AUTH-TOKEN")) {
        res.status(500).json({
            success: false,
            error: {
                message: "token not passed"
            }
        });
        return;
    }

    try {
        var token = req.get("X-AUTH-TOKEN");

        var user_credentials = jwt.verify(token, 'shhhhh');
        req.token = user_credentials

    }
    catch (err) {
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

 
 
//--------------Testing api-------------

app.get('/', (req, res) => {

    res.status(200).json({
        success: true,
        message: "Welcome to TODO APIS"
    });
    return;

});

//------------------------Testing Get req. api----------------------

app.get('/get/test',async (req, res) => {

	var tid=req.query.testid;
    var tn=req.query.testname;

  console.log("Testing Get req. api called \n");
  console.log(tid);
  console.log(tn);

	res.status(200).json({
		testid: tid,
		testname:tn,
		message: "Your entered response should come here.!"
		
	});
	return;

});


//---------------------- Create TO-do api --------------------

app.post('/create/todo',authHandler, async (req,res) => {

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
app.get('/get/dashboard',authHandler, async (req,res) => {

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
app.get('/get/delete_todo',authHandler, async (req,res) => {

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

app.get('/get/edit_todo',authHandler, async (req,res) => {
	
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
app.get('/get/deleted_dashboard',authHandler, async (req,res) => {

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
app.get('/get/profile_details',authHandler, async (req,res) => {

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

    if(!req.body.idtoken)
    {
        res.status(500).json({
            message: "id token is required",
            error: err
        });
        return;
    }

    try{

        var newUser = {
            uname: req.body.idtoken.name,
            uemail: req.body.idtoken.email
        }
        
        var logindet = {
            email: req.body.idtoken.email
        }

        var login_det = await Login.findOne({
            where: {
                email: email
            }
        });

        if(login_det)
        {
            var token = jwt.sign(login_det.dataValues, 'shhhh');
            res.status(200).json({
                success: true,
                token: token
            });
            return;
        }
        else{

            const t1 = await sequelize.transaction();
       
            var user_created = await User.create(newUser, { transaction: t1 });
            
            var login = await Login.create(logindet, { transaction: t1 });
            
            console.log(user_created);
            
            if(user_created)
            {
                await t1.commit();

                var login_det = await Login.findOne({
                    where: {
                        email: email
                    }
                });
                        
                var token = jwt.sign(login_det.dataValues, 'shhhh');
                res.status(200).json({
                    success: true,
                    token: token
                });
                return;
            }
            else{
                await t1.rollback();
            }

            res.status(500).json({
                success: false,
                error: `Cannot find your account`
            });
            return;
        }
    }
    catch(err)
    {
        await t1.rollback();
        console.log(err);
        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err.message} `
        });
        return;
    }
});

//----------------------Login Api---------------------

app.post('/login', async function (req, res) {

	console.log("## Login Api called\n");
	
    if (!req.body.googleRes) {
        res.status(500).json({
            message: "googleRes is required"
        });
        return;
    }

    try {

        // console.log(req.body);

        var newUser = {
            uname: req.body.googleRes.name,
            uemail: req.body.googleRes.email
        }

        var logindet = {
            email: req.body.googleRes.email
        }

        var login_det = await Login.findOne({
            where: {
                email: logindet.email
            }
        });

        if (login_det) {

            var userdata = await User.findOne({
                where: {
                    uemail: login_det.dataValues.email
                }
            });
            var token = jwt.sign(userdata.dataValues, 'shhhhh');

            console.log("===== TOKEN =====");
            console.log(token);
            console.log("===== TOKEN =====");
            
            res.status(200).json({
                success: true,
                token: token
            });
            return;
        }
        else {

            const t1 = await sequelize.transaction();

            var user_created = await User.create(newUser, { transaction: t1 });

            var login = await Login.create(logindet, { transaction: t1 });

            // console.log(user_created);

            if (user_created) {
                await t1.commit();

                var login_det = await Login.findOne({
                    where: {
                        email: logindet.email
                    }
                });

                var token = jwt.sign(login_det.dataValues, 'shhhhh');

                console.log("===== TOKEN =====");
                console.log(token);
                console.log("===== TOKEN =====");
                
                res.status(200).json({
                    success: true,
                    token: token,
                });
                return;
            }
            else {
                await t1.rollback();
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err.message} `
        });
        return;
    }
});


//=============================EOAPI====================================

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

//===============================EOF====================================