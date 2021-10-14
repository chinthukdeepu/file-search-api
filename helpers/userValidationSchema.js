const Joi = require('@hapi/joi');

const userSchema = Joi.object({
    email:Joi.string().email().lowercase().required(),
    full_name:Joi.string().required(),
    password:Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
    email:Joi.string().email().lowercase().required(),
    password:Joi.string().min(2).required(),
})


module.exports = {userSchema,loginSchema}