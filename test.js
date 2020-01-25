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
const User = sequelize.define('user',{

    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,

    email: {
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
const to_do = sequelize.define('to_do',
{

    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
    }
    
    },{
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

User.belongsTo(Login);
User.hasMany(to_do); /// one to many rel.
//------------
 sequelize.sync({
     force: true
 });
