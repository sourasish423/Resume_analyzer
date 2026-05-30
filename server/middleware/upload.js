const multer=require('multer');
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');},//where to store the uploaded files
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname);
    } ,        
});//by which name the file should be stored and date.now() is used to make the filename unique 
// by appending the current timestamp to the original filename

const upload=multer({
    storage,
});

module.exports=upload;
//multer is use to extract the data from the pdf