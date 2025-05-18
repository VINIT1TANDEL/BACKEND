const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt =require("bcryptjs");
 const jwt=require("jsonwebtoken");
const crypto=require("crypto");

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your Name"],
        maxLength:[30,"Name canot exceed 30 characters"],
        minLength:[4,"Name  should have more than 4 characters"],
    },
    email:{
        type:String ,
        required:[true,"Please enter your Email"],
        unique:true,
        validate:[validator.isEmail,"please  enter a valid email"]
    },
    password:{
        type:String ,
        required:[true,"Please enter your password"],
        minLength:[8,"Password should be greater than 8 characters"],
        select:false,
        
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },

    },
    createdAt:{
        type:Date,
        dafault:Date.now,

    },


    role:{
        type:String,
        default:"user",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})
userSchema.pre("save",async function(next){///pre-save middleware ...save is event ,,modifying before saving in the database

    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
});

//JWT token
userSchema.methods.getJWTToken= function(){
    return jwt.sign({
        id:this._id
    },process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });

}

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}


//SHA-256 is a commonly used method that turns any input into a long string of letters and numbers. It's a way to secure the token further.
//generating passsword reset token
userSchema.methods.getResetPasswordToken=function(){
    //generating token
    const resetToken=crypto.randomBytes(20).toString("hex");
    //hashing and to userSchema
     this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");//This hashed value is much harder to reverse-engineer than the original token.
     this.resetPasswordExpire=Date.now() + 15 *60*1000;
     return resetToken;

}


module.exports=mongoose.model("User",userSchema)






