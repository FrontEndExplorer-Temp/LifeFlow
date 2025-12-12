import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        bannedExpiresAt: {
            type: Date,
            default: null,
        },
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        googleId: String,
        githubId: String,
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
        profilePicture: {
            type: String,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        badges: [{
            id: String,
            date: {
                type: Date,
                default: Date.now
            }
        }],
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
