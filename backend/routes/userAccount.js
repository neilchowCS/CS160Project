const express = require('express');
const app = express();

// All userAccount endpoints go here

module.exports = app.get('/', (req, res)=>{
    res.status(200).send('Test GET request from userAccount.js file');
});