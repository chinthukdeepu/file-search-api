const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { NotExtended } = require('http-errors');

module.exports = {
    signAccessToken: (userId,role) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: '1h',
                issuer: `${role}`,
                audience: userId
            };
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    reject(createError.InternalServerError());
                } 
                resolve(token);
            })
        })
    },
    signRefreshToken: (userId,role) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn: '1y',
                issuer: `${role}`,
                audience: userId
            };
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    reject(createError.InternalServerError());
                } 
                resolve(token);
            })
        })
    },
    verifyRefreshToken:(refreshToken)=>{
        return new Promise((resolve,reject)=>{
            jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,payload)=>{
                if(err) return reject(createError.Unauthorized);
                const userId= payload.aud;
                const role= payload.iss;
                resolve({userId,role});
            })
        })
    },

    verifyAccesToken:(req,res,next) => {
        if(!req.headers['autherization']) return next(createError.Unauthorized());

        const autheHeader = req.headers['autherization'];
        const barerToken = autheHeader.split(' ');
        const token = barerToken[1];

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
            if(err){
                const message = err.name === 'JsonWebTokenError' ? 'Unautherized' : err.message;
                return next(createError.Unauthorized(message));
                
            }
            req.payload= payload;
            next();
        })
    },

    verifyAdminAccesToken:(req,res,next) => {
        if(!req.headers['autherization']) return next(createError.Unauthorized());

        const autheHeader = req.headers['autherization'];
        const barerToken = autheHeader.split(' ');
        const token = barerToken[1];

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
            if(err){
                const message = err.name === 'JsonWebTokenError' ? 'Unautherized' : err.message;
                return next(createError.Unauthorized(message));                
            }
            if(payload.iss !== 'admin'){
                return next(createError.Unauthorized('Unautherized'));
            }
            req.payload= payload;
            next();
        })
    }
}
