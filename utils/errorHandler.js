

class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode//adds property status code it is basically not pat of standard error usefull for http response
        Error.captureStackTrace(this,this.constructor);//This method helps in keeping track of where the error was created in the code, which is very helpful for debugging. It’s customizing the stack trace, so it points only to where this particular type of error (ErrorHandler) was instantiated, not from inside the Error class itself.
    }
}


module.exports=ErrorHandler