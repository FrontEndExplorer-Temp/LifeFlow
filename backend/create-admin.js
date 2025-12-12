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

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
            console.log('Usage: ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=securepass node create-admin.js');
            process.exit(1);
        }

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            userExists.isAdmin = true;
            userExists.isVerified = true;
            // Only update password if user exists and we want to reset it? 
            // Better to just update status for existing user as per previous logic, 
            // but the prompt implies securing the *creation* which includes password.
            // If the user exists, we usually don't want to accidentally overwrite their password unless intended.
            // However, for an admin script, we might want to ensure they can login.
            // Let's stick to the previous logic of just upgrading permissions for existing users
            // unless the script explicitly intended to reset admin credentials.
            // The previous logic didn't update password for existing users.

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

        console.log(`Admin user '${adminEmail}' is now ready.`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
