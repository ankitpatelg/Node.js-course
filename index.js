const express = require("express");
const cors = require("cors")
require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");
const app = express();
var jwt = require('jsonwebtoken')
const jwt_secret_key = "ankitlodhi1997"
app.use(express.json());
app.use(cors());
app.post("/register",async(req,resp)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    jwt.sign({ result }, jwt_secret_key, { expiresIn: '2h' }, function(err, token){
        if(err){
            resp.send({result:'no user found'});
        }
        resp.send({result,token:token});
    });
})
app.post("/login",async(req,resp)=>{
    console.log(req.body)
    if(req.body.password && req.body.email) 
    {
        let user = await User.findOne(req.body).select("-password");
        if(user){
            jwt.sign({ user }, jwt_secret_key, { expiresIn: '2h' }, function(err, token){
                if(err){
                    resp.send({result:'no user found'});
                }
                resp.send({user,auth:token});
            });
        }
        else{
            resp.send({result:'no user found'});
        }
        

    }
    else {
        resp.send({result:'no user found'})
    }
   
})
app.post("/addproduct",verifyToken,async(req,resp)=>{
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})
app.get("/products",verifyToken,async(req,resp)=>{
    let products = await Product.find();
    if(products.length>0){
        resp.send(products);
    } else{
        resp.send({result:"no product found"})
    }
})
app.delete("/product/:id",verifyToken,async(req,resp)=>{
    const result = await Product.deleteOne({_id: req.params.id});
    resp.send(result);
});
app.get("/product/:id",verifyToken,async(req,resp)=>{
    let result = await Product.findOne({_id:req.params.id});
    if(result){
        resp.send(result)
    }
    else{
        resp.send({result:"not found"});
    }
})
app.get("/search/:key",verifyToken,async(req,resp)=>{
    let result = await Product.find({
        "or":[
            {name:{$regex: req.params.key}},
            {category:{$regex: req.params.key}}
        ]
    })
    resp.send(result);
})
app.put("/product/:id",verifyToken,async(req,resp)=>{
    let result = await Product.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
});

// verify fction
function verifyToken(req,res,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split('')[1];
        jwt.verify(token,jwt_secret_key,(err,valid)=>{
            if(err){
                res.status(401).send({result:"Please provite token"})
            }
            else {
                next();
            }
        })
    }
    else{
        res.status(403).send({result:"Please add token with header"})
    }
}
app.listen(5000);