const express = require('express');
const app = express();
app.use(express.json())
const userAccountValidation = require('../validations/userAccountValidation') // request validations for user account actions
const userAccountService = require('../services/userAccountService'); // business logic for user user account actions


// GET endpoint for testing
module.exports = app.get('/', (req, res)=>{
    res.status(200).send('Test GET request from userAccount.js file');
});

// POST endpoint for registering a user account
module.exports = app.post('/register', async (req, res)=> {
    // validate schema
    const { error, value } = userAccountValidation.registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }
    const [ status, response ] = await userAccountService.registerUser(req.body);
    
    return res.status(status).json(response);
});