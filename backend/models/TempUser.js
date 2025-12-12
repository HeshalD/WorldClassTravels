import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const tempUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    otp: {
        type: String,
        required: true
    },
    otpExpires: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document will be automatically deleted after 10 minutes
    }
});

// Hash password before saving
tempUserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    try {
        const hash = await bcrypt.hash(this.password, 12);
        this.password = hash;
    } catch (error) {
        throw error;
    }
});

// Method to generate OTP
tempUserSchema.methods.createOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

const TempUser = mongoose.model('TempUser', tempUserSchema);

export default TempUser;
