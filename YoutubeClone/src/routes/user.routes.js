import {Router} from 'express'
import {registerUser} from '../controllers/user.controller.js'
const router = Router();

//where should we route("/register") and should we do after routing there (get,post,etc)
router.route("/register").post(registerUser) //    http://localhost:8000/api/v1/users/register
router.route("/login").post(registerUser) //    http://localhost:8000/api/v1/users/login

export default router;