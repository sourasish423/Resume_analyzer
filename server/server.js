const express = require('express');
const cors = require('cors');

const uploadRoute = require('./routes/uploadRoute');// Import the upload route

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/upload", uploadRoute); // if someone visits this path then Use the upload route

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});