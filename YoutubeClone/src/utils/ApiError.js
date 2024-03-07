//It is used to handle Error / Api error
//Error is an node class and we want to modify that class to create our unique error class

class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors = [],
        stack = ""
    ){
        //super is used to overwrite constructor function
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors;


        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}