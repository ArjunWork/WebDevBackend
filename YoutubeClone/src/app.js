//it is express files
import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; //to access and set cookies of user browser

const app = express();

//to whitelist the app wesbite domain to server database
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

//use is used to either configuration or to set middlewares
//right now we are using use to say that our express server is acception json data with limit so that our server dont crash
//json data will come from a form which we will submit on our webapp
app.use(express.json({
        limit:"16kb"   
    })
);

//to accept data from url we use urlencoded to decode url data for express like %20 as space etc
app.use(express.urlencoded({
        extended:"true", //extended is used when we want to pass objects in objects(nested objects) {extended:{}}
        limit:"16kb"
    })
);

//to accept some images or pdf or favicon etc and to show these to public
app.use(express.static(
        "public"  //public folder which we created in our YoutubeClone  name has paased here the public folder will hold the data after reciving
    )
);

//to set and accept cookies from user browser safely and the server can do crud operation
app.use(cookieParser());

export {app};