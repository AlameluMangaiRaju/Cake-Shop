const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const url="mongodb://localhost:27017/";
const path = require('path');
const bcrypt=require('bcrypt');


const {MongoClient} = require("mongodb");
const client=new MongoClient(url);
app.use(express.urlencoded({ extended: true }));
async function connect(){
    try{
        await client.connect();
        console.log('MongoDB Connected');
    }
    catch(err)
    {
        console.log('err occ');
        process.exit(1);
    }
}

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes for each HTML page
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/about', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/booking', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/reg', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'reg.html'));
});
app.get('/insert', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/view_user', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'view_user.html'));
});
app.get('/submission', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'submission.html'));
});

const db=client.db("photo");
const coll=db.collection("regusers");

app.get('/insert',async function(req,res){
    
    var doc = {
        fullname: req.query.fullname,
        username: req.query.username,
        email: req.query.email,
        phoneNumber: req.query.phone,
        password: req.query.password,
        confirmpassword: req.query.confirmpassword,
        
    };
    const db=client.db("photo");
    const coll=db.collection("regusers");
    var existinguser = await coll.findOne({username: doc.username});
    if(existinguser){
        res.send("User already exist");
    }
    else{
    var result=await coll.insertOne(doc);
    res.redirect( 'login.html');
    res.end();
    }
});
app.post('/lcheck',async function(req,res) {
    try{
        const check = await coll.findOne({username: req.body.username});
        if(!check) {
            return res.send("user name cannot found");
        }
        
        //compare the hash password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            return res.redirect( 'main.html');
        }else {
            return res.send("wrong password");
        }
    }catch (error) {
        console.error("error", error);
        return res.status(500).send("an error");
    }

});
app.get('/binsert',async function(req,res){
    
    var doc = {
        fullname: req.query.fullname,
        email: req.query.email,
        event: req.query.event,
        time: req.query.time,
        date: req.query.date,
        number: req.query.number,
        
    };
    
    const db=client.db("photo");
    const coll=db.collection("bookers");
    var result=await coll.insertOne(doc);
    res.end();
});



app.get('/delete',async function(req,res){
    
    var doc={email:req.query.email};
    const db=client.db("photo");
    const coll=db.collection("regusers");
    var result=await coll.deleteOne(doc);
    
    res.redirect( 'login.html');

    res.end();
});

app.get('/findall',async function(req,res){
    const db = client.db("photo");
    const coll = db.collection("regusers");
    var result = await coll.find({},{_id:0,fullname:1,username:1,email:1,phoneNumber:1,password:1}).toArray();
    
    res.write("<h1>Customers:</h1>");
    res.write("<ol>");
    
    for(var i=0;i<result.length;i++)
    {
        res.write("<li>");
        res.write("NAME :"+result[i].username+"<br>"+"EMAIL :"+result[i].email+"<br>"+"MOBILE NO :"+result[i].phoneNumber+"<br>"+"PASSWORD :"+result[i].password+"<br>");
        res.write("</li>");
    }
    res.write("</ol>")
    res.write("||<a href='main.html'>Home</a>");
    res.end();
});

app.get('/update',async function(req,res){
    
    var doc=req.query.email;
    var newdoc=req.query.npassword;

    const db=client.db("photo");
    const coll=db.collection("regusers");
    var result=await coll.updateOne({email: doc}, {$set:{password:newdoc}});
    res.redirect( 'login.html');

    res.end();
});
app.post("/", function (request, response) {
    var num1 = request.body.num1;
    response.write("<h1>POST WORKING</h1>");
    response.end();
});

const PORT = 5000;

app.listen(PORT, function () {
    console.log(`Server is running at http://localhost:${PORT}`);
    connect();
});