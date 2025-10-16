const Joi = require('joi'); // library for defining schemas for json schema validation

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

const loginSchema = Joi.object({email: Joi.string().email().required(), password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
    }).required();

module.exports = {
    registrationSchema,
    loginSchema
}

