// this is the place backend wil upload the pdf 
const {GoogleGenerativeAI} = require('@google/generative-ai');
const express=require('express');
const router=express.Router();
const upload=require('../middleware/upload');//bring the multer setup here
const pdf=require("pdf-parse");//bring the pdf-parse library here
const fs=require('fs');

const genAI=new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

router.post('/',upload.single('pdf'),//when someone send a post req  then run this code
async(req,res)=>{
    console.log(req.file);//this will print the file details in the console
    
    const dataBuffer=fs.readFileSync(req.file.path);//this will read the file
    const data=await pdf(dataBuffer);//this will extract the text from the pdf
    const model=genAI.getGenerativeModel({model: 'gemini-3.5-flash'});//this will use the gemini 2.5 flash model to process the text
   
    const result=await model.generateContent(
        `Summarize this document: ${data.text}`
        
    );//this will summarize the extracted text 

    
    const summary=result.response.text();//this will get the summarized text

    res.json({
        text:data.text,
        summary:summary
    })
});




router.post('/ask',async(req,res)=>{
    const {question,text}=req.body;//get the question and text from the request body
    const model=
    genAI.getGenerativeModel({model: 'gemini-3.5-flash'});//used the same model to answer the question

    const result=await model.generateContent(
        `
        Document:
        ${text}
        Question:
        ${question}

        Answer the question based on the document above.
        `  
    )
    const answer=result.response.text();//this will get the answer from the model
    res.json({answer:answer});//send the answer back to the client
});

module.exports=router;