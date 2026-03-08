// create-users.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Sample users to create
const sampleUsers = [
    {
        name: 'Amit Kumar',
        email: 'amit@student.com',
        password: 'student123',
        role: 'student',
        location: {
            coordinates: {
                latitude: 27.7172,
                longitude: 85.3240
            }
        }
    },
    {
        name: 'Prakash Sharma',
        email: 'prakash@teacher.com',
        password: 'teacher123',
        role: 'teacher',
        location: {
            coordinates: {
                latitude: 27.7100,
                longitude: 85.3300
            }
        }
    },
    {
        name: 'Sita Rai',
        email: 'sita@student.com',
        password: 'student123',
        role: 'student',
        location: {
            coordinates: {
                latitude: 27.7200,
                longitude: 85.3250
            }
        }
    }
];

async function createUsers() {
    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Create each user
        for (const userData of sampleUsers) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ email: userData.email });
                
                if (existingUser) {
                    console.log(`⚠️  User already exists: ${userData.email}`);
                    continue;
                }

                // Create user
                const user = await User.create(userData);
                console.log(`✅ Created ${user.role}: ${user.name} (${user.email})`);
            } catch (error) {
                console.log(`❌ Error creating ${userData.email}:`, error.message);
            }
        }

        console.log('\n🎉 Done! All users created.');
        
        // Show summary
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        console.log(`\n📊 Summary:`);
        console.log(`   Students: ${studentCount}`);
        console.log(`   Teachers: ${teacherCount}`);
        console.log(`   Total: ${studentCount + teacherCount}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit();
    }
}

createUsers();