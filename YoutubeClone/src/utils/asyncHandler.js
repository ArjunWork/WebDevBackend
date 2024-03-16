//it is an api response handler
//here we are createing a warpper function which can used anywhere where we want to connect to somewhere

//here we are using promises which will return promise

const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=>{
                return next(error)
        })
    }
};

export {asyncHandler}

/*

same code in try and catch method here we are using requestHandler as a fn

//it is a special higher order function(which accept a function and return a function as a variable)
// here this function is same as this function

//const asyncHandler = (func)=>{
//    async (func)=>{}
//}

//we just removed the outer braces

//generally this bracket conatins four parts (error,request,response,next)



const asyncHandler = (fn)=> async (req,res,next) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}
*/