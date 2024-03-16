import {Router} from 'express'
import {registerUser} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
const router = Router();

//where should we route("/register") and should we do after routing there (get,post,etc)
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




export default router;