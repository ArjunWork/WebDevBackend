import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//bcrypt helps us to hash our password
//jsonwebtoken helps us to manage and encrypt our tokens and password
//jsonwebtoken is bearer tokens means it will encypt the data make the encrypted data the key , whichevere person/user holds the key and demands the data we will simply provide data to that person

const userSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trime:true,
            index:true,
        },
        email:{
            type:String,
            required: true,
            unique: true,
            lowercase:true,
            trime:true,
        },
        password:{
            type:String,
            required: [true,"Password is Required"],
        },
        fullName:{
            type:String,
            required: true,
            trime:true,
            index:true,
        },
        avatar:{
            type:String, //cloudinary  url
            required: true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        refreshToken:{
            type:String,
        }
    },{timestamps:true}
);

//to use bcrypt and jsonwebtoken to encrypt our data we use mongoose hook 'pre' to encrypt our data just before adding it to db
//in this pre hook we will not use arrow function()=>{} as callback because arrow function dosent have this reference that is it wont be able access the current userSchema password which we want to encrypt
//the encryption is a time consuming process thus we will write async
//every middle wear must have next access

userSchema.pre("save",async function(next){
    //if password is modified then only do encryption
    if(this.isModified("password")){
        this.password =await bcrypt.hash(this.password,10) // 10 = for how much round you want to encrypt data
        next(); 
    }
    else{
        next();
    }
}) 

//to create our own mongoose method we use methods
//to checkif after encryption the data and password are still same or not
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); //password is normal non encypted password and this.password is encrypted password
    //here bcrypt.compare will return true or false
}

//now we will use jwt to generate token which will act as key to access data for limited amount of time
//Refresh token is stored in db and active token is stored on client side
//it will ask for few parameters to generate this token

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        //it will ask for object which is payload here
        {
            _id:this._id,   //id will be generted by mongodb on each new user
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },
        
        //now it will ask for access token
        process.env.ACCESS_TOKEN_SECRET,

        //now It will ask or expiry object
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


//refresh token takes only few parameteres because it refreshes ocasinally
userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        //it will ask for object which is payload here
        {
            _id:this._id,   //id will be generted by mongodb on each new user
        },
        
        //now it will ask for access token
        process.env.REFRESH_TOKEN_SECRET,

        //now It will ask or expiry object
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);