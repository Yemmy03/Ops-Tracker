import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate issue ID before saving
issueSchema.pre('save', async function (next) {
  if (!this.issueId) {
    // Generate issue ID like ISSUE-001, ISSUE-002, etc.
    const count = await mongoose.model('Issue').countDocuments();
    this.issueId = `ISSUE-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better query performance
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ createdBy: 1 });
issueSchema.index({ createdAt: -1 });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
