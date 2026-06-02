import axios from "axios";
import { useState } from "react";

function App(){
  const [file,setFile]=useState(null);

  const handleUpload=async()=>{
    const formData=new FormData();
    formData.append("pdf",file);

    const response=await axios.post("http://localhost:5000/api/upload",formData);

    console.log(response.data);
  }

  return(
    <div>
        <h1>PDF Insight</h1>

        <input
        type="file"
        accept=".pdf"
        onChange={(e)=>setFile(e.target.files[0])}
        />
        {file && <p> {file.name}</p>}
        {/* sending file to backend */}
        <button onClick={handleUpload}>Upload PDF</button>
        
    </div>
  );
}
export default App;