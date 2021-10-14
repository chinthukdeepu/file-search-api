const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const createError = require('http-errors');
require('dotenv').config();
require('./helpers/connectDatabase');

const authRoute = require('./routes/authRoute');
const fileRoute = require('./routes/fileRoute');

const app = express();

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
}));

app.use('/bucket',express.static('bucket'))
//app.use(express.static(__dirname + '/files'));

app.use(morgan('dev'));
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res, next) => {
    res.send('you are noware !');
})

//for all auth routes
app.use('/auth', authRoute);

//for all file routes
app.use('/file', fileRoute);

//for handling unhandled routes
app.use((req, res, next) => {
    next(createError.NotFound('Api You are looking for is not available'));
})

//for handling errors
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })

})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})