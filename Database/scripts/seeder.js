import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Issue from '../src/models/Issue.js';
import AuditLog from '../src/models/AuditLog.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@opstacker.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Manager',
    email: 'manager@opstacker.com',
    password: 'manager123',
    role: 'manager',
  },
  {
    name: 'Jane Developer',
    email: 'jane@opstacker.com',
    password: 'user123',
    role: 'user',
  },
  {
    name: 'Bob Developer',
    email: 'bob@opstacker.com',
    password: 'user123',
    role: 'user',
  },
];

const issues = [
  {
    title: 'Fix login authentication bug',
    description: 'Users are experiencing issues logging in with special characters in their passwords.',
    status: 'Open',
    priority: 'High',
    assignedTo: 'jane@opstacker.com',
    tags: ['authentication', 'bug', 'urgent'],
    estimatedHours: 8,
  },
  {
    title: 'Implement password reset feature',
    description: 'Add functionality for users to reset their passwords via email.',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: 'bob@opstacker.com',
    tags: ['feature', 'authentication'],
    estimatedHours: 16,
    actualHours: 6,
  },
  {
    title: 'Optimize database queries',
    description: 'Several dashboard queries are running slowly. Need to add indexes.',
    status: 'Open',
    priority: 'Medium',
    assignedTo: 'jane@opstacker.com',
    tags: ['performance', 'database'],
    estimatedHours: 12,
  },
  {
    title: 'Add dark mode to UI',
    description: 'Implement dark mode theme toggle.',
    status: 'Open',
    priority: 'Low',
    tags: ['feature', 'ui', 'enhancement'],
    estimatedHours: 20,
  },
  {
    title: 'Fix mobile responsive layout',
    description: 'Dashboard table not displaying correctly on mobile.',
    status: 'Closed',
    priority: 'High',
    assignedTo: 'bob@opstacker.com',
    tags: ['bug', 'ui', 'mobile'],
    estimatedHours: 10,
    actualHours: 12,
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany();
    await Issue.deleteMany();
    await AuditLog.deleteMany();

    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const issuesWithCreator = issues.map(issue => ({
      ...issue,
      createdBy: adminUser._id,
    }));

    console.log('📋 Creating issues...');
    const createdIssues = await Issue.insertMany(issuesWithCreator);
    console.log(`✅ Created ${createdIssues.length} issues`);

    console.log('📝 Creating audit logs...');
    const auditLogs = [
      {
        action: 'USER_REGISTER',
        user: adminUser._id,
        description: 'Admin user registered',
        status: 'success',
      },
      {
        action: 'ISSUE_CREATE',
        user: adminUser._id,
        targetIssue: createdIssues[0]._id,
        description: `Issue created: ${createdIssues[0].title}`,
        status: 'success',
      },
    ];
    
    await AuditLog.insertMany(auditLogs);
    console.log(`✅ Created ${auditLogs.length} audit logs`);

    console.log('\n🎉 Data import successful!');
    console.log('\n👤 Test Credentials:');
    console.log('   Admin: admin@opstacker.com / admin123');
    console.log('   Manager: manager@opstacker.com / manager123');
    console.log('   User: jane@opstacker.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log('🗑️  Deleting all data...');
    await User.deleteMany();
    await Issue.deleteMany();
    await AuditLog.deleteMany();
    console.log('✅ Data destroyed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
