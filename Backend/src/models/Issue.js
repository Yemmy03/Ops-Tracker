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
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    dueDate: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate issue ID before saving
issueSchema.pre('save', async function (next) {
  if (!this.issueId) {
    const count = await mongoose.model('Issue').countDocuments();
    this.issueId = `ISSUE-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Auto-set resolvedAt when status changes to Closed
  if (this.isModified('status') && this.status === 'Closed' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

// Compound indexes for common queries
issueSchema.index({ status: 1, priority: -1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ createdBy: 1, status: 1 });
issueSchema.index({ assignee: 1, status: 1 });
issueSchema.index({ priority: -1, createdAt: -1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ updatedAt: -1 });

// Text index for search
issueSchema.index({ title: 'text', description: 'text', assignedTo: 'text' });

// Method to check if overdue
issueSchema.methods.isOverdue = function () {
  if (!this.dueDate || this.status === 'Closed') {
    return false;
  }
  return this.dueDate < new Date();
};

// Static method to get statistics
issueSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        byPriority: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 },
            },
          },
        ],
        total: [
          {
            $count: 'count',
          },
        ],
        avgResolutionTime: [
          {
            $match: {
              status: 'Closed',
              resolvedAt: { $exists: true },
            },
          },
          {
            $project: {
              resolutionTime: {
                $subtract: ['$resolvedAt', '$createdAt'],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$resolutionTime' },
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
