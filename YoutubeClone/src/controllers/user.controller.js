import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudnary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt  from 'jsonwebtoken'

//in asyncHandler we will pass a function 

// C.) we are creating it as functionality beacuse we genarlly use it many times
const generateAccessAndRefereshTokens = async function(userId){
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //now pass this refresh token in mongo db and save it to store it
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave:false }); //it means save directly dont ask extra things like password again to save this data
        
        return {accessToken,refreshToken}
    } 
    catch (error) {
        throw new ApiError(500,`Something went wrong while generating access and refresh tokens : ${error}`);
    }
} 


// A.) Register user
const registerUser = asyncHandler( async (req,res)=>{ //we are using extra async because cloudinary in step 5 will take its time upload the images 
    // 1.) get user details from front end / postman
    // 2.) validate things like email or info is not empty
    // 3.) check is user already exist : username , email
    // 4.) check for neceessary details like images and avatar
    // 5.) upload them to cloudinary also check on cloudinary wheater avatar has been uploaded on cloudinary
    // 6.) create user object for mongodb - create entry in db
    // 7.) remove password and refresh token feild from response from user object creation (because in mongodb whatever we pass while creating object after creation it will pass entire deatails as response)
    // 8.) check for user creation response wheather user object has been created or not 
    // 9.) return response



    // 1.) get user details from front end / postman

    const {fullName,email,username,password}  = req.body  //req.body is provided by express
    // console.log("email : ",email);



    // 2.) validate if info is not empty

    //for multiple validation
    if(
        //some is a function which return true or false after checking something for checking we have to provide a callback function which take field(fullName,userName,email,password) as an argument and check wheter they are empty or not
        [fullName,email,username,password].some((field)=> 
        field?.trim()==="") //return true if after trim the field is empty 
    ){
        throw new ApiError(400,"All fields are compulsary or required")
    }
    /* if u want to check only one error
    if(fullName ===""){
        throw new ApiError(400,"Full Name Is Required");
    }
    */



    // 3.) check is user already exist : username , email
    
    const existedUser = await User.findOne({
        //if you want to validate or check multiple things you have to use operators to use operator u have to use dollar sign $ and what operator you want to use after that you have to pass the array of objects of all the things you want to check
        $or : [{ username }, { email }]
    })

    if(existedUser){
        //if you havent created the apierror file then you have to use 
        // res.send("error",(error)=>{console.error(error)})
        //new is used because ApiError is a class to create its object you have to use new To call its constructor
        throw new ApiError(409,"User already exist with username or email address")
    }




    // 4.) check for neceessary details like images and avatar are passed or not 
    
    //multer helps us to add more fields while sending request
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    /* 
        req.files  //multer give you an option of req.files
        req.files?  //to check if files are empty or not
        req.files?.avatar   //we are writing avatar because in routes/user.routes.js we have passed file name avatar with the help of multer,
        req.files?.avatar[] //the field avatar will have a lot propert its size, type(png,jpg,etc) etc but we will take first property
        req.files?.avatar[0] //first property will have an object which might exist ,we want
        req.files?.avatar[0]? //to check if object is presnt which we want
        req.files?.avatar[0]?.path  //with the help of path we will get the entire path which multer used to store or upload this file
        this will be path cb(null, './public/temp') you can study it in middlewears/multer.middleweare.js 
    */
   //check if avatar is passed or not
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
   }





   // 5.) upload them to cloudinary also check on cloudinary wheater avatar has been uploaded on cloudinary
   
   //cloudinary will take time to upload the files thus we are using await and for this only we had used extra async in out function
   const avatar = await uploadOnCloudinary(avatarLocalPath);   //avatar is response from cloudinary in the form of object 
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   //check on cloudinary wheater avatar has been uploaded on cloudinary
   if(!avatar){
    throw new ApiError(400,"Avatar file is not uploaded to cloudinary");
   }





   // 6.) create user object for mongodb - create entry in db
   const user = await User.create({ //db is in another continent it may take some time
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "" ,//we havent checked for cover images thus we have to use condition operator to chcek if itr exist then take its url or take empty string
    email,
    password,
    username:username.toLowerCase()
   })
   
   
   
   
    // 7.) remove password and refresh token feild from response from user object creation (because in mongodb whatever we pass while creating object after creation it will pass entire deatails as response)
    //now to check if user was created or not we will use find by id
    //whenever we create a user the mongo db aotomatically add an id with it which we can access be _id
    //now we will use select after findById ,generally in select all things are bydefault are selected
    //if we want to not select some items we have to pass them in string with a -(highpen)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )





    // 8.) check for user creation response wheather user object has been created or not 
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }




    // 9.) return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerd successfully")
    )
})


// B.) Login User
const loginUser = asyncHandler( async(req,res,next)=>{
    // 1.) extract info from frontend login page/form
    // 2.) check if all field are filled
    // 3.) find the user in db
    // 4.) if user is there than do password check
    // 5.) now generate access token and refresh token
    // 6.) send token via cookies


    // 1.) extract info from frontend login page/form
    const {username,password,email} = req.body
    console.log(email);

    if(!(username || email)){
        throw new ApiError(400,"Username or Email is required to login")
    }

    // 2.) check if all field are filled
    if(
        [password].some((field)=>{
            field?.trim() ===""
        })
    ){
        throw new ApiError(400,"Enter password to login");
    }

    // 3.) find user in db
    const userExist = await User.findOne({
        $or : [{username},{email}]
    })
    // if user doesnt exist
    if(!userExist){
        throw new ApiError(404,"User Doesnt Exist")
    }

    // 4.) check password
    const isPasswordValid = await userExist.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password")
    }

    // 5.) now generate access token and refresh token
    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(userExist._id);


    // 6.) send token via cookies
    //create new user insatance which will have new active token and we will remove password and any refreshtoken if exist
    const loggedInUser = await User.findById(userExist._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly:true, //cookies are visible for everyone but only server can modifiy it
        secure:true
    }
    // console.log("Access token is ",accessToken);
    // console.log("Refresh token is ",refreshToken);
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)    //we can use cookies beacuse in app.js we have used cookieparser
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            201,
            {
                //we are sending it accessToken and refreshToken because maybe the user wants to store these tokens in its mobile for testing purpose
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )

})


// D.) LogOut User
//in loginUser we have taken user info to login thuswe know which one is the user but in the case of LogoutUser we dont know who is user beacuse we are not filling the form for logOut to ectract details email and password which we used to do in logIn thus we have to create an middleWear to pass user creedintials to LogoutUser function this middlewear will be authenticaction middlewear auth.middleware.js
const logoutUser = asyncHandler( async(req,res,next)=>{
    // 1.) access the user and delete its refresh token
    // 2.) clear its cookies


    // 1.) access the user and delete its refresh token
    // we have user object in our request which was passed by verifyJWT middleware thus now we can use this user object to logOut the user
    //we can use findById() but after doing this we have to remove password and refresh token and then update the function it is long process
    //we are going to use findByIdAndUpdate it will find the object by id and update whatever we want to do and at last we can also tell it to return updated value
    //we are going to use await because its is mongooose operation
    await User.findByIdAndUpdate(
        req.user?._id, //find by id
        {
            $unset:{
                refreshToken: 1, //we have erased the refreshToken
            }
        },
        {
            new: true, // we have returned the new updated object which dosent have refreshToken thus user is now logOut
        }
    )

    // 2.) clear its cookies
    const options = {
        httpOnly:true, //cookies are visible for everyone but only server can modifiy it
        secure:true
    }

    console.log("User is LogOut Now");
    return res
    .status(200)
    .clearCookie("accessToken",options) //it is also provided by cookieparser
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"));
})


// E.) End Point where api will hit to generate new access and refresh token(Session Storage)
//access token is generally stored in your computer and refresh token is stored in db ,access token is short lived ,thus whenever the access token expire we generally throw 401 error at frontend to relogin to avoid this situation we have refresh token ,
//whenever the access token expires we pass access token with refresh token at an end point(which we are going to create)where it will hit the api, if there the recieved refresh token and db stored refresh token if both are same then it generate the new access and refresh token and automatically relogin the user without informing him

// ** ** before making the end point we have to create a controller ** **
// we will create the end point in user.routes.js
const refreshAccessToken = asyncHandler( async(req,res,next)=>{

    // 1.) take incoming refresh toke
    // 2.) decode and verify the refresh token
    // 3.) now from this decoded token find user id from db
    // 4.) now compare db user refresh token with incoming refresh token
    // 5.) now generate new refresh token
    // 6.) at last return the response

    // 1.) take incoming refresh toke
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken //if someone is using moblie phone
    //if i dont find any refresh Token
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized Request");
    }


    //since we are going to use db thus it is advised to use try and catch
    try {
        // 2.) decode and verify the refresh token    
        //verify the refresh token
        //the user refresh token which we are receving is encrypted token and the token which we store in our db is raw token(non encrypted)
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
    
    
        // 3.) now from this decoded token find user id from db    
        //now we have userId from decodedToken beacuse refresh token was encoded using id in user.model.js => userSchema.methods.generateRefreshToken thus after decoding we have user id
        const user = await User.findById(decodedToken?._id);
        //if we couldnt find user related to this token
        if(!user){
            throw new ApiError(401,"invalid refresh token");
        }
    
        
    
        // 4.) now compare db user refresh token with incoming refresh token    
        //now we have incomingRefreshToken which we recived from user for reloggin and for db refresh token we will take help from our recently created user id
        // we know that in generateAccessAndRefereshTokens function in this file we have used this line user.refreshToken = refreshToken; await user.save({ validateBeforeSave:false }); thus we have refresh token in our current user which is stored in db thus we can compare these both tokens
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token is used/expired");
        }
    
    
    
        // 5.)now generate new refresh token
        const {newAccessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id);
    
        
    
        // 6.) at last return the response

        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken",newAccessToken,options)    //we can use cookies beacuse in app.js we have used cookieparser
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                201,
                {accessToken: newAccessToken, refreshToken: newRefreshToken},
                "Access Token Refresh Successfully"
            )
        );

    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }

});


// F.) Change current password
//top check weather user is logged in or not or verified or not we will use middlewear verifyJWt in routes
const changeCurrentPassword = asyncHandler( async(req,res,next)=>{
    // 1.) accept parameter from body
    // 2.) check weather newPassword and confirmPassword is same or not
    // 3.) extract usuer info from req.user object generated by verifyJWT
    // 4.) verify password from db the isPasswordCorrect will return either true or false
    //5.)now since all things are good now change password
    // 6.) return response


    // 1.) accept parameter from body
    const {oldPassword,newPassword,confirmPassword} = req.body


    // 2.) check weather newPassword and confirmPassword is same or not
    if(newPassword!==confirmPassword){
        throw new ApiError(400,"New Password and Confirm Password are not same")
    }


    // 3.) extract usuer info from req.user object generated by verifyJWT
    const user = await User.findById(req.user?._id);
    //user doesnt exist
    if(!user){
        throw new ApiError(400,"User does not exist");
    }


    // 4.) verify password from db the isPasswordCorrect will return either true or false
    const validPassword = await user.isPasswordCorrect(oldPassword);
    //invalid password
    if(!validPassword){
        throw new ApiError(402,"Wrong old Password");
    }


    //5.)now since all things are good now change password
    user.password = newPassword;
    await user.save({validateBeforeSave:false}); //to ignore all other validation before saving other then password validation
    

    // 6.) return response
    return res
    .status(200)
    .json( new ApiResponse(200,{},"Password changed Successfully"));
});


// G.) to get Current user(to check who liked subscribe or comment etc) which is loggedin
const getCurrentUser = asyncHandler( async(req,res,next)=>{
    
    /*
    
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400,"User not exist");
    }

    const currentUser = user.select("-password -refreshToken");
    
    */

    //return the response with current user which we obtained from req.user which was injected by verifyJWT 
    return res
    .status(200)
    .json( new ApiResponse( 201,req.user,"current user fetched successfully"));
})


// H.) Update Account Details(we need both fullName as well as email to update details)
const updateAccountDetails  = asyncHandler( async(req,res,next)=>{
    // 1.) extract info both fullName and email from req.body 
    // 2.) find user details and update the details and remove the password from user
    // 3.) return the user now


    // 1.) extract info both fullName and email from req.body 
    const {fullName,email} = req.body;
    //if any field is missing
    if(!(fullName||email)){
        throw new ApiError(400,"All Fields Are Required");
    }


    // 2.) find user details and update the details and remove the password from user
    const user =await User.findByIdAndUpdate(
        req.user?._id, //id to find the user
        {            
        $set:{          //what are the things to update
                fullName,
                email:email, //here fullName and email both are correct because fullName is updated with fullName having name same it can be updated like this with the help of ES6 and with the help of ES5 we can update email like email:email
            }
        },        
        {new:true} //it helps us the return the updated value which can be stored in our const user
    ).select("-password");


    // 3.) return the user now
    return res
    .status(200)
    .json( new ApiResponse(200,user,"Account details updated successfully"));
})


// I.) we will have seprate function to update file(other than update account details) it good for industrial practice for this we will have avatar update and coverimage seprate function
//to update avatar first we have to check weather user is logged in or neot using verifyJWT after that we have to use multer to send files
const updateAvatar = asyncHandler( async(req,res,next)=>{
    
    // 1.) find user by user object in req
    // 2.) find local filePath which is uploaded by multer before reciving this file/image in our local sterrorage    
    // 3.) now upload this file on cloudinary(unlink will be done by cloudinary function itself)    
    // 4.) now since file has been uploaded now reflect changes in db i.e => update db avatar url with new url  and remove password
    // 5.) return updated image user
    
    
    // 1.) find user by user object in req    
    const user  = await User.findById(req.user?._id);
    //user dosent exist
    if(!user){
        throw new ApiError(400,"Please login to update Avatar Image|| Cant find user");
    }


    // 2.) find local filePath which is uploaded by multer before reciving this file/image in our local sterrorage
    const avatarLocalPath = req.file?.path //we got it from multer middleware
    // if file is not present in our local storage
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing");
    }


    // 3.) now upload this file on cloudinary(unlink will be done by cloudinary function itself)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //if file not uploaded
    if(!avatar.url){
        throw new ApiError(400,"Avatar file is not uploaded to cloudinary due to some error");
    }


    // 4.) now since file has been uploaded now reflect changes in db i.e => update db avatar url with new url 
    // also remove password
    user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url,
            }
        },
        {
            new:true,
        }
    ).select("-password");


    // 5.) return updated image user
    return res
    .status(200)
    .json( new ApiResponse(200,user,"avatarImage has been Updated"))
})

// J.) to update Cover Image File
const updateCoverImage = asyncHandler( async(req,res,next)=>{
    
    // 1.) find user by user object in req
    // 2.) find local filePath which is uploaded by multer before reciving this file/image in our local sterrorage    
    // 3.) now upload this file on cloudinary(unlink will be done by cloudinary function itself)    
    // 4.) now since file has been uploaded now reflect changes in db i.e => update db coverImage url with new url  and remove password
    // 5.) return updated image user
    
    // 1.) find user by user object in req    
    const user  = await User.findById(req.user?._id);
    //user dosent exist
    if(!user){
        throw new ApiError(400,"Please login to update coverImage user|| Cant find user");
    }


    // 2.) find local filePath which is uploaded by multer before reciving this file/image in our local sterrorage
    const coverImageLocalPath = req.file?.path //we got it from multer middleware
    // if file is not present in our local storage
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing");
    }


    // 3.) now upload this file on cloudinary(unlink will be done by cloudinary function itself)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //if file not uploaded
    if(!coverImage.url){
        throw new ApiError(400,"coverImage file is not uploaded to cloudinary due to some error");
    }


    // 4.) now since file has been uploaded now reflect changes in db i.e => update db coverImage url with new url 
    // also remove password
    user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url,
            }
        },
        {
            new:true,
        }
    ).select("-password");


    // 5.) return updated image user
    return res
    .status(200)
    .json( new ApiResponse(200,user,"CoverImage has been Updated"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
};