// this is the place backend wil upload the pdf 
const express=require('express');
const router=express.Router();
const upload=require('../middleware/upload');//bring the multer setup here
const pdf=require("pdf-parse");//bring the pdf-parse library here
const fs=require('fs');

router.post('/',upload.single('pdf'),//when someone send a post req  then run this code
async(req,res)=>{
    console.log(req.file);//this will print the file details in the console
    
    const dataBuffer=fs.readFileSync(req.file.path);//this will read the file
    const data=await pdf(dataBuffer);//this will extract the text from the pdf
    console.log(data.text);//print the extracted text in the console
    res.json({
        text:data.text,
    })
});

module.exports=router;