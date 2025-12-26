import mongoose from 'mongoose';

const visaSchema = new mongoose.Schema({
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        unique: true
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    coverImage: {
        type: String,
        required: [true, 'Cover image is required'],
        trim: true
    },
    imagePath: {
        type: String,
        required: [true, 'Image path is required'],
        trim: true
    }
}, {
    timestamps: true
});

const Visa = mongoose.model('Visa', visaSchema);

export default Visa;
