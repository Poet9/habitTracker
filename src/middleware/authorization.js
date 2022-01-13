const jwt = require('jsonwebtoken');
const User = require('../routers/userSchema');

const auth = async (req, res, next)=>{
    try {
        const myToken = req.rawHeaders[1].split(' ')[1];
        const decodedToken = jwt.verify(myToken, process.env.JWTSECRET15MIN);
        const user = await User.findOne({_id : decodedToken._id});
        if (!user){ throw new Error("user not found")};
        req.user = user;
        next();
    } catch (e){
        res.status(403).send({error: e.message});
    }
}

module.exports = auth;