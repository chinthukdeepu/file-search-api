const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const { verifyAccesToken, verifyAdminAccesToken } = require('../helpers/jwtHelper');
const { User, File } = require('../models/UserModel');


// for adding a file to user
router.post('/add', verifyAccesToken, async (req, res, next) => {

    const userId = req.payload.aud;

    const fileObj = req.files.file;
    // Use the mv() method to place the file somewhere on your server
    fileObj.mv('bucket/' + userId + fileObj.name.toLowerCase(), function (err) {
        if (err)
            next(createError.BadRequest(err.message));
    });

    try {
        const currentUser = await User.findById(userId);
        if (currentUser) {
            const newFile = new File({ file_name: userId + fileObj.name.toLowerCase() });
            newFile.save();

            console.log(currentUser);
            currentUser.files.push(newFile);
            currentUser.save().then(() => {
                res.send({ currentUser });
            }).catch((err) => {
                next(err);
            })
        }
    } catch (error) {
        next(error);
    }
})


router.get('/', verifyAccesToken, async (req, res, next) => {
    const userId = req.payload.aud;
    const role = req.payload.iss;
    const keyword = req.query.keyword;

    User.findById(userId).populate({
        path: 'files',
        match: { "file_name": { $regex: '.*' + keyword + '.*' } }
    }).exec((err, data) => {
        if (err) {
            next(error);
        }
        res.send(data.files)
    });

})

router.get('/all', verifyAdminAccesToken, async (req, res, next) => {
    const userId = req.payload.aud;
    const role = req.payload.iss;
    const keyword = req.query.keyword;

    File.find({ "file_name": { $regex: '.*' + keyword + '.*' } }, function (err, data) {
        if (err) {
            next(error);
        }
        else {
            res.send(data)
        }
    })

})

module.exports = router;