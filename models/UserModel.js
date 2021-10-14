const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;


const FileSchema = new Schema({
    file_name: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
})

const File = mongoose.model('file', FileSchema);

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    full_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    files:[{ type: Schema.Types.ObjectId, ref: 'file' }]
})

// UserSchema.pre('save', async function (next) {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(this.password, salt);
//         this.password = hashedPassword;
//         next();

//     } catch (error) {
//         next(error);
//     }

// })

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('user', UserSchema);


module.exports = {User,File};
