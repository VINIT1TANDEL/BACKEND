const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError=require("..//middleware/catchAsyncErrors");
const User=require("../models/userModels");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const crypto=require("crypto")
const cloudinary=require("cloudinary");


//Register a User
exports.registerUser=catchAsyncErrors( async (req,res,next) =>{
    // console.log('Request body:', req.body); // Log request body for debugging
    try {
      const { name, email, password, avatar } = req.body;
      if (!name || !email || !password || !avatar) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale',
      });
  
      const user = await User.create({
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });
  
      sendToken(user, 201, res);
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Server error' });
    }

});

//Login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
      return next(new ErrorHandler("please enter email and password",400))
    }

    const user= await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    
    const isPasswordMatched =await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    
    sendToken(user,200,res);
})

exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        success:true,
        messsage:"Logged out",
    })
})

exports.forgetPassword=catchAsyncErrors(async(req,res,next)=>{
    const { email } =req.body;
    const user= await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    //get password token
    const resetToken=user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message=`Your password reset token is:- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignore it`;
    try{
        await sendEmail({
            email:user.email,
            subject:`NovaKart Passoword Recovery😄😄`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
            
        })
    }catch(error){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500))

    }  
})

exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        // resetPasswordExpire: { $gt: Date.now() },
    });
if(!user){
    return next(new ErrorHandler("Reset password  token is invalid or has been expired",404));
}
if(req.body.password!==req.body.confirmPassword){
    return next(new ErrorHandler("password does not match",404));
    
}
user.password=req.body.password;
// user.resetPasswordToken=undefined;
// user.resetPasswordExpire=undefined;
await user.save();
sendToken(user,200,res);
})

//get user details
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    res.status(200).json({
        success:true,
        user,
    })
})

//update user password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
   
    const user=await User.findById(req.user._id).select("+password");
    const isPasswordMatched =user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",401));
    }
    if(req.body.newPassword!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match ",401));
    }
    user.password=req.body.newPassword;
    await user.save()
    sendToken(user,200,res);
})


//update user Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    // console.log("Avatar data:", req.body.avatar); // Log the avatar data
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
     
    
    if (req.body.avatar && req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if (user.avatar.public_id) {
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
      }
  
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
  
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  });
  
//get all users(admin)

exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{

    const users=await User.find();
    res.status(200).json({
        success:true,
        users
    });
});
//get single user(admin)
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User Does not exist with id ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user
    });

});


//update user-roll
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });

//delete user-
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

const user= await User.findById(req.params.id);

if(!user){
    return next(new ErrorHandler(`user not exist with Id: ${req.params.id}`))



}

const imageId = user.avatar.public_id;

await cloudinary.v2.uploader.destroy(imageId);

await  user.deleteOne();
   res.status(200).json({
    success:true,
    message:"user deleted successfully"
   })
})
