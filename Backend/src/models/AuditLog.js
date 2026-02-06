import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_UPDATE',
        'USER_DELETE',
        'ISSUE_CREATE',
        'ISSUE_UPDATE',
        'ISSUE_DELETE',
        'ISSUE_STATUS_CHANGE',
        'ISSUE_ASSIGN',
        'PASSWORD_CHANGE',
        'ROLE_CHANGE',
        'OTHER',
      ],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetIssue: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

// Compound indexes
auditLogSchema.index({ user: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, status: 1, createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.log = async function ({
  action,
  user,
  description,
  targetUser = null,
  targetIssue = null,
  metadata = {},
  ipAddress = null,
  userAgent = null,
  status = 'success',
}) {
  try {
    await this.create({
      action,
      user,
      targetUser,
      targetIssue,
      description,
      metadata,
      ipAddress,
      userAgent,
      status,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function (userId, limit = 50) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('targetUser', 'name email')
    .populate('targetIssue', 'issueId title');
};

// Static method to get issue history
auditLogSchema.statics.getIssueHistory = async function (issueId, limit = 50) {
  return await this.find({ targetIssue: issueId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

// Static method to get activity summary
auditLogSchema.statics.getActivitySummary = async function (startDate, endDate) {
  const match = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ...(endDate && { $lte: endDate }),
    },
  };

  return await this.aggregate([
    { $match: match },
    {
      $facet: {
        byAction: [
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        byUser: [
          {
            $group: {
              _id: '$user',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userInfo',
            },
          },
          {
            $unwind: '$userInfo',
          },
          {
            $project: {
              count: 1,
              name: '$userInfo.name',
              email: '$userInfo.email',
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        total: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
