/*
    //one way to connect to .env
    require('dotenv').config({path:'./env'})
*/

//import  dotenv
import dotenv from 'dotenv'

//for db connection
import connectDB from "./db/index.js";

//for express
import {app} from './app.js'

//config dotenv if using import 
dotenv.config({
    path:'./.env'
})

//Function execution to connect to db
//connectDb is an async code which means whenever the async code completes it will return a promiss which we can use to connect to app.express 
connectDB()
.then(()=>{

    //to handle an error for express i.e if db is connected but unable to contact to express so we add express listeners
    app.on("error",(error)=>{
        console.error("ERROR While connecting MONGODB to express:- ",error);
        throw error;
    })

    //after succesfully connection of data base we will start our server
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App server listening at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console(`MongoDb connection Failed !! unable to connect to App express :- ${error}`);
    throw error;
})



/*


//First approch to connect to db
//its side effects is that it pollutes(additional extra code /readablity issue) the index.js files

//for db connection
import mongoose from "mongoose";
import {DB_NAME} from "./constants"
import connectDB from "./db";

//for app initialisation
import express from 'express'
const app = express();

//created ifi (immediate invoked function) to connect to db
//we are using async await to to throw an error if error occurs and wait for db connection
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        //to handle an error if db is connected but unable to contact to express so we add listeners
        app.on("error",(error)=>{
            console.error("ERROR While connecting db to express:- ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port : ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR While connecting to db:- ",error);
        throw error;
    }
})()

*/