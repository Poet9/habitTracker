const express = require('express');
const User = require('./userSchema');
const auth = require('../middleware/authorization');
const jwt = require('jsonwebtoken');
const dns = require('dns');
const { append } = require('express/lib/response');

const router = express.Router({strict: true});

// creating users 
router.post('/', async (req, res)=>{
    const newUser = new User(req.body);
    try{
        const mailDomaine = newUser.email.split('@');
        dns.resolve(mailDomaine[1], (err, address)=>{
            if(err){
               return res.status(400).end({error: ("Unvalid email")});
            }
        });
        await newUser.save();
        const token = await newUser.generateWebToken();
        const junkToken = await jwt.sign({_id: newUser._id.toString()}, process.env.JWTSECRET15MIN,{expiresIn: 900});
        res.cookie('Authorization', junkToken, {sameSite: "none", httpOnly: true, secure: true});
        res.status(201).send({newUser, token});
    } catch (e){
        res.status(400).send({error: e.message});
    }
});
// loggin
router.post('/login', async (req, res)=>{
    try {
      const myEmail =  req.body.email.toString().toLowerCase();
      const user = await User.findByCredentials(myEmail, req.body.password);
      const junkToken = await jwt.sign({_id: user._id}, process.env.JWTSECRET15MIN,{expiresIn: 900});
      const token = await user.generateWebToken();
      res.cookie("Authorization", junkToken, {httpOnly: true, sameSite: "none", secure: true});
      res.send({user, token});
   } catch (e) {
      res.status(400).send({error: e.message});
   }
});
//get new access token
router.post("/token", async (req, res)=>{
    try{
        const refreshToken = await jwt.verify(req.body.token, process.env.JWTSECRET);
        const user = await User.findOne({_id: refreshToken._id});
        if(!user){throw new Error();}
        const token = user.tokens.find(token => token.token === req.body.token);
        if(!token){throw new Error();}
        const junkToken = await jwt.sign({_id: user._id}, process.env.JWTSECRET15MIN,{expiresIn: 900});
        //setting new cookie
        res.clearCookie("Authorization", {sameSite: "none", secure: true});
        res.cookie("Authorization", junkToken, {httpOnly: true, sameSite: "none", secure: true});
        res.send(user);
    } catch (e){
        res.status(400).send({error: e.message});
    }
});
// get user 
router.get('/', auth, async (req, res)=>{
    try{
        res.send(req.user);
    } catch (e){
        res.status(404).send({error: e});
    }
});
// updating a user 
router.patch('/me', auth, async (req, res)=>{
    const allowedUpdates = ['username', 'password'];
    const updates = Object.keys(req.body);
    const isAllowed = updates.every(value => allowedUpdates.includes(value));
    if(!isAllowed){
        return res.status(401).send({error :'Unauthorized update'});
    }
    try {
        updates.forEach(update=>{
           if(req.user[update]=== req.body[update]){
              throw new Error(`Please provide a new value for ${update}`);
           }
           req.user[update] = req.body[update];
        });
        await req.user.save();
        res.send(req.user);
     } catch (e) {
        res.status(403).send({error: e.message});
     }
});
// log out session
router.post('/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => token.token !==req.token);
        await req.user.save();
        res.clearCookie("Authorization", {sameSite: "none", secure: true});
        res.send({res: 'logged out successfully.'});
    } catch(e){
        res.status(500).send({error: e.message});
    }
});
//log out all session
router.post('/logoutall', auth, async (req, res)=>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.clearCookie("Authorization", {sameSite: "none", secure: true});
        res.send({res: "Logged out successfully"});
    } catch (e){
        res.status(500).send({error: e.message});
    }
});
// deleting a user 
router.delete('/me', auth, async (req, res)=>{
    try{
        await User.findByCredentials(req.user.email, req.body.password);
        await req.user.remove();
        res.clearCookie('Authorization', {sameSite: 'none', secure: true});
        res.send({res: 'User deleted successfully'});
    } catch (e) {
        res.status(500).send({error: e.message});
    }
});

module.exports = router;