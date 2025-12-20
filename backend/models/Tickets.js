import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userFirstName: {
        type: String,
        required: true,
        trim: true
    },
    userLastName: {
        type: String,
        required: true,
        trim: true
    },
    userPhoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    tripType: {
        type: String,
        required: true,
        enum: ['one-way', 'round-trip', 'multi-city']
    },
    departureLocation: {
        type: String,
        required: true,
        trim: true
    },
    arrivalLocation: {
        type: String,
        required: true,
        trim: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: function() {
            return this.tripType === 'round-trip';
        }
    },
    cabinType: {
        type: String,
        required: true,
        enum: ['economy', 'premium economy', 'business', 'first class']
    },
    passengers: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index for better query performance
ticketSchema.index({ userID: 1, createdAt: -1 });

export default mongoose.model('Ticket', ticketSchema);
