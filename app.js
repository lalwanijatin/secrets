require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
	  extended: true
	}));

app.use(express.static("public"));

app.listen(3000,function(){
	console.log("Server started");
});

app.get('/',function(req,res){
	res.render('home');
});

app.get('/login',function(req,res){
	res.render('login');
});

app.get('/register',function(req,res){
	res.render('register');
});


mongoose.connect('mongodb://localhost/userDB',{useNewUrlParser:true});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
	const userSchema = mongoose.Schema({
		email : String,
		password: String
	});
	
	const secret = process.env.SECRET;
	userSchema.plugin(encrypt, { secret: secret, encryptedFields:['password'] });
	//userSchema.plugin(encrypt, { secret: secret});
	
	const User = new mongoose.model("User",userSchema);
	
	app.post('/register',function(req,res){
		const user = new User({
			email : req.body.username,
			password : req.body.password
		});
		user.save(function(err){
			if(err) res.send("Error occured");
			else res.render("secrets");
		});
	});
	
	
	app.post('/login',function(req,res){
		
		/*User.find({},function(err,users){
			if(err) res.send("Sorry couldn't process your request");
			let isPresent = false;
			console.log(users);
			if(err) res.send(err);
			else{
				users.forEach(function(user){
					if(user.email === req.body.username && user.password === req.body.password){
						isPresent = true;
						res.render('secrets');
					}
				});
				if(!isPresent) res.send("wrong emailid or password");
			}
		});*/
		
		User.findOne({email:req.body.username},function(err,user){
			if(err) res.send("Sorry couldn't process your request");
			else if(!user) res.send("Wrong Email id");
			else{
				console.log("user : "+user);
				if(user.password === req.body.password){
					res.render("secrets");
				}else{
					//console.log("password "+password);
					console.log("password typed "+req.body.password);
					console.log("actual password "+user.password);
					res.send("Wrong password");
				}
				
			}
		});
		
		/*User.findOne({email:req.body.username,password:req.body.password},function(err,user){
			if(err) res.send("Sorry couldn't process your request");
			else if(!user) res.send("Wrong Email id or password");
			else{
				res.render("secrets");
			}
		});*/
	});
});