import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudnary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

//in asyncHandler we will pass a function 

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
    console.log("email : ",email);



    // 2.) validate if info is not empty

    //for multiple validation
    if(
        //some is a function which return true or false after cehcking something for checking we have to provide a callback function which take field(fullName,userName,email,password) as an argument and check wheter they are empty or not
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
    
    const existedUser = User.findOne({
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
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
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

export {registerUser}