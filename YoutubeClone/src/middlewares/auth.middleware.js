//this middleware of authentication will verify wheater user exist or not for logOut purpose
//we will take help of JWTtoken(access token and refresh token) to check wheater the user is login or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken"; 
import { User } from "../models/user.model.js";

//this middlewear will be used/run by routes user.routes.js for logout function in user.model.js 
export const verifyJWT = asyncHandler( 
    //sometimes we use _ (underscore) at fileds where those are not used like here response (res) was not used thus we wrote _ here
    async (req,_,next) => {

        //we will use trycatch because it has databse operation ,there are chances of failure
        try {
            //we can access token with the help of cookies because request have cookies (cookieParser())
            //we have addedd this accessToken in cookies in our loginUser in user.controller.js in return response part
            //maybe cookies dont have accesstoken maybe it has header which has accesstoken(for postman app or for mobile devloper tester)
            //we have used replace because in postman we send token like this Authorization : Bearer <Token>; we dont need this "Bearer" and space after bearer " " so we are replacing it with empty string with no space
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
            

            //if token dosent exist
            if(!token){
                throw new ApiError(401,"Unauthorized Request");
            }
        
            //now decode this jwt token info and verify it
            //to verify it jwt will require the token and its secret key to decode this token
            //the user refresh token which we are receving is encrypted token and the token which we store in our db is raw token(non encrypted)
            const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            
            //this decoded Token will have _id ,email,username,fullname because this is what we have encoded in accessToken in userSchema.methods.generateAccessToken in user.model.js
            //now with the help of _id we can call mongoose db and extract all the info of this id
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
            //if user dosent exist
            if(!user){
                throw new ApiError(401,"Invalid Access Token");
            }
        
            //after getting user now we will add new object user in our request 
            //since it is middlare thus it can modiy the request also which is going to passed in logoutUser thus now the request reached at logoutUser will now have user object which it can use to logout this object user
            req.user = user;
            //router sometime mayget confused which it should run in sequence generally it run first one (verifyJWT) but after running it gets confused that was there something else(logoutUser) which i forgot to run then to tackel this situtaion we run next() at the end of defination of middlewear in verifyJWT 
            next();
        }
        catch (error) {
            console.log(req);
            throw new ApiError(401,error?.message||"Invalid access Token")
        }
})