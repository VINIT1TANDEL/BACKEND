const ErrorHandler = require("../utils/errorHandler");

//wrong mongodb id error

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error" ;

    if(err.name==="CasterError"){
        const message=`Resource not found.Invalid:${err.path}`;
        err=new ErrorHandler(message,400);
    }

    //mongoose duplicate keyerror
    if(err.code===11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} entered`;
        err=new ErrorHandler(message,400);
    }
    //wrong JWT error
    if(err.name==="JsonWebTokenError"){
        const message=`JsonWebToken is Invalid,try again`;
        err=new ErrorHandler(message,400);
    }
    //JWT expire
    if(err.name==="TokenExpiredError"){
        const message=`JsonWebToken is Expired,try agian`;
        err=new ErrorHandler(message,400);
    }
    
    res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });
};
