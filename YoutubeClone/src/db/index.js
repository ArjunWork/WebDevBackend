//this file will connect mongodb and will return the function which can be executed to connect to mongodb

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        //mongoose will return an object after connecting to db which we are storing
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected Succesfully !! DB host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("ERROR While connecting to MONGODB:- ",error);
        process.exit(1)
    }
}

export default connectDB;