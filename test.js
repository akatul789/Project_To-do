const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');

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


///// ----------------
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
//---------------------
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

//---------------------

const Login = sequelize.define('login',
{

    log_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	password: Sequelize.STRING,
	email: {
        type: Sequelize.STRING,
    	allowNull: false,
    }
    },{
        timestamps: false
});

Login.belongsTo(User,{foreignKey: 'email', targetKey: 'uemail'});
User.hasMany(To_do,{foreignKey:'user_id'}); /// one to many rel.
//---------------


 //~ sequelize.sync({
     //~ force: true
 //~ });
 
 //-------test
app.get('/' ,  (req,res) => {

    res.status(200).json({
        success: true,
        message: "Welcome to TODO APIS"
    });
    return;

});

//---- Create user api --

app.post('/create/user', async (req,res) => {

    var email = req.body.emailid;
    var username = req.body.username;

    var newUser = {
        uname: username,
        uemail: email
    }

   try{
       
        var user_created = await User.create(newUser);

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

//---- Create TO-do api --

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

//------ Dashboard api----
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

//------ Delete todo api----
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

//----------Edit todo api-----

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


//~ app.get('/get/user', async (req,res) => {

    //~ var user_id = req.query.userid;

    //~ try{

        //~ var user_data = await User.findOne({
            //~ where: {
                //~ uid: user_id
            //~ }
        //~ });

        //~ if(user_data)
        //~ {
            //~ res.status(200).json({
                //~ user: user_data
            //~ });
            //~ return;
        //~ }

        //~ // findOne  --> {}
        //~ // findAll -- >  [ {} , {} , {}]


    //~ }
    //~ catch(err){
        //~ console.log(err);
        //~ res.status(500).json({
            //~ message: "error while getting data from table"
        //~ });
        //~ return;
    //~ }

//~ })


//~ app.post('/create/user', async (req,res) => {

    //~ var email = req.body.emailid;
    //~ var username = req.body.username;

    //~ var newUser = {
        //~ mailid: email,
        //~ username: username
    //~ }

   //~ try{
       
        //~ var user_created = await User.create(newUser);

        //~ console.log(user_created);
        
        //~ if(user_created)
        //~ {
            //~ res.status(200).json({
                //~ message: "User created successfully"
            //~ });
            //~ return;
        //~ }
   //~ }
   //~ catch(err){
    //~ console.log(err);
    //~ res.status(500).json({
        //~ message: "User not created",
        //~ error: err
    //~ });
    //~ return;
   //~ }

//~ })



// get
// post

app.listen(port, () => {
    console.log("Server started on port ${port}");
});

