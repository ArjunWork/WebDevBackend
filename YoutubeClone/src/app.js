//it is express files
import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; //to access and set cookies of user browser

const app = express();

//use is used to either configuration or to set middlewares

// 1.) to whitelist the client app wesbite domain to server database
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

// 2.) now handle data 

// a.) incoming json files in form format
//right now we are using use to say that our express server can accept json data with our predefine limit so that our server dont crash
//json data will come from a form which we will submit on our webapp
app.use(express.json({
        limit:"16kb"   
    })
);

// b.) incoming data from domain name which we have to decode
//to accept data from url we use urlencoded to decode url data for express like %20 as space etc
app.use(express.urlencoded({
        extended:"true", //extended is used when we want to pass objects in objects(nested objects) {extended:{}}
        limit:"16kb"
    })
);

// c.) Incoming data(pdf,images,etc) which we want to show 
//to accept some images or pdf or favicon etc and to show these to public
app.use(express.static(
        "public"  //public folder which we created in our YoutubeClone  name has paased here the public folder will hold the data after reciving
    )
);

// d.) to set and reset data from cookies
//to set and accept cookies from user browser safely and the server can do crud operation
app.use(cookieParser());



//Routes Import
import userRouter from './routes/user.routes.js'

//Routes declaration
//initially we used to write app.get() because at that time we were not declaring routers outeside the file of express right now we have declared routes outside the file thus we have to use some middle ware to import routes into express file to use app.get()
//we will use middle ware 'use' to use router

app.use("/api/v1/users",userRouter) //    http://localhost:8000/api/v1/users

export {app};