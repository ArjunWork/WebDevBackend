import {asyncHandler} from '../utils/asyncHandler.js'

//in asyncHandler we will pass a function 
const registerUser = asyncHandler( 
    async (req,res)=>{
        res.status(200).json({
            message:"ok"
        })
    }
)

export {registerUser}