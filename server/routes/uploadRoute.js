// this is the place backend wil upload the pdf 
const express=require('express');
const router=express.Router();
const upload=require('../middleware/upload');//bring the multer setup here

router.post('/',upload.single('pdf'),//when someone send a post req  then run this code
(req,res)=>{
    console.log(req.file);//this will print the file details in the console
    res.json({
        success:true,
        message:'File uploaded successfully',//this will send a response back to the frontend
        file:req.file,
    })
});

module.exports=router;