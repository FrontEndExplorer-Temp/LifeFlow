import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

console.log('Script started...');
console.log('MONGO_URI defined:', !!process.env.MONGO_URI);

const createAdmin = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('DB Connected');

        const adminEmail = 'admin@lm.com';
        const adminPassword = 'password123';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            userExists.isAdmin = true;
            userExists.isVerified = true;
            await userExists.save();
            console.log('Existing user updated to Admin');
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                isAdmin: true,
                isVerified: true
            });
            console.log('Admin user created');
        }

        console.log(`Admin Credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
