//we will take file from user with the  help of mutler and will store it on our local storge//local server 
//now we will pass the local server //storgae path to cloudnary to upload it on 3rd party server(cloudnary)
//now after succefully uploading it on cloudnary we have to delete it on our local server//storage

//in this we are not using multer insted we are using fs = file system because multer is middle wear and right now we dont need it
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'    //file system in nodejs used for read write remove(unlink) file

//this is standard code uploaded on cloudnary
cloudinary.config({ 
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
  api_key: process.env.CLOUDNARY_API_KEY, 
  api_secret: process.env.CLOUDNARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        //if localFilePath has not been passed
        if(!localFilePath) return null;

        //upload the file on cloudinary
        const response  = await cloudinary.uploader.upload(`${localFilePath}`,{
            resource_type : 'auto', //auto detect wheter its video image pdf etc
        })

        //after file upload
        console.log("File Has Been Uploaded On Cloudinary ",response.url);
        
        //now remove /unlink file from local storage
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        //remove temp file from our local storage/server if upload got failed to remove any malicious corrupt files

        fs.unlinkSync(localFilePath)
    }
}

export {uploadOnCloudinary}

//this is standard code uploaded on cloudnary
// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });