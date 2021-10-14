const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const bcrypt = require('bcrypt');

const {User} = require('../models/UserModel');
const { userSchema, loginSchema } = require('../helpers/userValidationSchema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');



// for publuc user registration
router.post('/register', async (req, res, next) => {
    try {
        const result = await userSchema.validateAsync(req.body);
        const userExist = await User.findOne({ email: result.email });
        if (userExist) throw createError.Conflict(`${result.email} is already taken`);

        const user = new User(result);
        //
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(result.password, salt);
        user.password = hashedPassword;
        //
        const newUser = await user.save();
        const accesToken = await signAccessToken(newUser.id,newUser.role);
        const refreshToken = await signRefreshToken(newUser.id,newUser.role);
        const {full_name,role} = user;
        res.send({ accesToken, refreshToken, full_name, role });

    } catch (error) {
        if (error.isJoi === true) error.status = 422;
        next(error);
    }
})

// for public user login
router.post('/login', async (req, res, next) => {
    try {
        const result = await loginSchema.validateAsync(req.body);
        const user = await User.findOne({ email: result.email });
        if (!user) throw createError.NotFound('Not a registered user please check email');

        const isValid = await user.isValidPassword(result.password);
        if (!isValid) throw createError.Unauthorized('Invalid Username or password');

        const {full_name,role} = user;

        const accessToken = await signAccessToken(user.id,role);
        const refreshToken = await signRefreshToken(user.id,role);
        res.send({ accessToken, refreshToken ,full_name, role});
    }
    catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest(error.message))
        next(error);
    }
})

// for generating new token form refresh token
router.post('/refresh-token', async(req, res, next) => {
    try{
        const {refreshToken} = req.body;
        if(!refreshToken) throw createError.BadRequest();
        const {userId,role} = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId,role);
        const newRefreshToken = await signRefreshToken(userId,role);
        res.send({accessToken:accessToken,refreshToken:newRefreshToken});

    }catch(error){
        next(error);
    }
})

router.delete('/logout', (req, res, next) => {
    res.send('logout');
})

module.exports = router;