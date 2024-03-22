import {Router} from 'express'
import {loginUser, logoutUser, registerUser} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

//create router for usage
const router = Router();

//where should we route("/register") and what should we do after routing there (get,post,etc)
//we are going to use multer as middlewear to pass file before going to /register

router.route("/register").post(     //http://localhost:8000/api/v1/users/register
    upload.fields([         //fields accept array (to pass multiple files)
        {
            name:"avatar", //in mongoose we have created field / object of name avatar in models/user.model.js 
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),       
    registerUser) 

router.route("/login").post(loginUser)

//secured routes
// we need to pass the verifyJWT middlewear from auth.middlewarew.js before going to logoutUser 
//router sometime mayget confused which it should run in sequence generally it run first one (verifyJWT) but after running it gets confused that was there something else(logoutUser) which i forgot to run then to tackel this situtaion we run next() at the end of defination of middlewear in verifyJWT 
router.route("/logout").post(verifyJWT,  logoutUser);




export default router;