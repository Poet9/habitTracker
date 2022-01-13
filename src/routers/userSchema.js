const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Habit = require('./habitSchema');

const userSchema = mongoose.Schema({
    username : {
        type: String,
        required : true,
        trim: true,
        unique: true
    },
    email : {
        type: String,
        trim: true,
        lowerCase: true,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true,
        validate(value){
            if(value.length <7){
               throw new Error('Password too short');
            }
         }
    },
    tokens: [{
       token: {
          type: String,
          required: true
       }
    }]
 },{
     versionKey:"habitTrackerYeah"
 }, {
    timeStamps: true
 });

 // static methods 
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email});
    if(!user){throw new Error('Unvalid email or password')}; // if email is wrong
    // const decodedjwt = jwt.verify(password, process.env.JWTSECRET); // getting ps
    const psMatch = await bcrypt.compare(password, user.password); //compare ps with user's ps
    if (! psMatch) {throw new Error('Unvalid email or password')} // if ps is wrong
    return user;
}
//virtual RS between habit and user
userSchema.virtual('habits', {
    ref: 'Habit',
    localField: '_id',
    foreignField: 'owner'
});
// methods
userSchema.methods.generateWebToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWTSECRET); // create token
    this.tokens = this.tokens.concat({token}); //add toke to user's tokens
    await this.save(); // save user
    return token;
}
// deleting sensitive info from user object
userSchema.methods.toJSON = function(){
    const userObj = this.toObject(); 
    delete userObj.password; // delete ps
    delete userObj.tokens; // delete tokens
    return userObj;
}
// hash ps before saving 
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        //const decoded = jwt.verify(this.password, process.env.CLIENT_KEY);
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});
// delete tasks if user delete acc 
userSchema.pre('remove', async function(next){
    await Habit.deleteMany({owner: this._id});
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;