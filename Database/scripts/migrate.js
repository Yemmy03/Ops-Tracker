import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  try {
    console.log('🔄 Starting database migration...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // User indexes
    console.log('👥 Creating User indexes...');
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isActive: 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('✅ User indexes created\n');

    // Issue indexes
    console.log('📋 Creating Issue indexes...');
    const issuesCollection = db.collection('issues');
    await issuesCollection.createIndex({ issueId: 1 }, { unique: true, sparse: true });
    await issuesCollection.createIndex({ status: 1 });
    await issuesCollection.createIndex({ priority: 1 });
    await issuesCollection.createIndex({ createdBy: 1 });
    await issuesCollection.createIndex({ assignee: 1 });
    await issuesCollection.createIndex({ status: 1, priority: -1 });
    await issuesCollection.createIndex({ status: 1, createdAt: -1 });
    await issuesCollection.createIndex({ createdBy: 1, status: 1 });
    await issuesCollection.createIndex({ assignee: 1, status: 1 });
    await issuesCollection.createIndex({ priority: -1, createdAt: -1 });
    await issuesCollection.createIndex({ createdAt: -1 });
    await issuesCollection.createIndex({ updatedAt: -1 });
    await issuesCollection.createIndex(
      { title: 'text', description: 'text', assignedTo: 'text' },
      { name: 'issue_text_search' }
    );
    console.log('✅ Issue indexes created\n');

    // AuditLog indexes
    console.log('📝 Creating AuditLog indexes...');
    const auditLogsCollection = db.collection('auditlogs');
    await auditLogsCollection.createIndex({ action: 1 });
    await auditLogsCollection.createIndex({ user: 1 });
    await auditLogsCollection.createIndex({ status: 1 });
    await auditLogsCollection.createIndex({ createdAt: -1 });
    await auditLogsCollection.createIndex({ user: 1, createdAt: -1 });
    await auditLogsCollection.createIndex({ action: 1, createdAt: -1 });
    await auditLogsCollection.createIndex({ targetIssue: 1, createdAt: -1 });
    await auditLogsCollection.createIndex({ status: 1, createdAt: -1 });
    await auditLogsCollection.createIndex({ user: 1, action: 1, createdAt: -1 });
    await auditLogsCollection.createIndex({ action: 1, status: 1, createdAt: -1 });
    console.log('✅ AuditLog indexes created\n');

    console.log('🎉 Migration completed successfully!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
