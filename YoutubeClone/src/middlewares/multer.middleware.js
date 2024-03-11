//we will use multer on each any every place as a middleware where findle handling is required in local server or storage
import multer from 'multer';


//this is standard function we copied from multer git repo
//it has two work at which destination you want them to store the file
const storage = multer.diskStorage({
    destination: function (req, file, cb) { //multer allows us to pass file as a avriables thus we use multer
        //cb  stands for callback
        cb(null, './public/temp') //here at place of null we can write how to handle error
        //here second thing is the path where we want to keep all the files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage,})