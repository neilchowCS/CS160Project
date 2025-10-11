const express = require('express');
const app = express();
app.use(express.json())
const Joi = require('joi'); // library for defining schemas for json schema validation

const userAccountService = require('../services/userAccountService'); // import userAccountService which contains all business logic


// GET endpoint for testing
module.exports = app.get('/', (req, res)=>{
    res.status(200).send('Test GET request from userAccount.js file');
});

// user registration schema
const registrationSchema = Joi.object({
    first_name: Joi.string()
        .min(1)
        .max(30)
        .pattern(new RegExp('^[A-Za-z]+$'))
        .required(),

    last_name: Joi.string()
        .min(1)
        .max(30)
        .pattern(new RegExp('^[A-Za-z]+$'))
        .required(),
    
    email: Joi.string()
        .email()
        .required(),
    
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    repeat_password: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({ 'any.only': 'repeat_password must match password' }),
}).required();

// POST endpoint for registering a user account
module.exports = app.post('/register', (req, res)=> {
    // validate schema
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }
    const [ status, response ] = userAccountService.registerUser(req.body);
    
    return res.status(status).json(response);
});