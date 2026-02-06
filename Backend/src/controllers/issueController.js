import Issue from '../models/Issue.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all issues
 * @route   GET /api/issues
 * @access  Private
 */
export const getIssues = asyncHandler(async (req, res, next) => {
  const { status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build query
  const query = {};

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Search in title, description, or assignedTo
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { assignedTo: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort
  const sortOrder = order === 'desc' ? -1 : 1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const issues = await Issue.find(query)
    .sort(sort)
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: issues.length,
    data: issues,
  });
});

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Private
 */
export const getIssue = asyncHandler(async (req, res, next) => {
  const issue = await Issue.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!issue) {
    return next(new AppError('Issue not found', 404));
  }

  res.status(200).json({
    success: true,
    data: issue,
  });
});

/**
 * @desc    Create new issue
 * @route   POST /api/issues
 * @access  Private
 */
export const createIssue = asyncHandler(async (req, res, next) => {
  const { title, description, status, priority, assignedTo } = req.body;

  const issue = await Issue.create({
    title,
    description,
    status: status || 'Open',
    priority: priority || 'Medium',
    assignedTo,
    createdBy: req.user._id,
  });

  logger.info('Issue created', { 
    issueId: issue._id, 
    title: issue.title,
    createdBy: req.user.email 
  });

  res.status(201).json({
    success: true,
    message: 'Issue created successfully',
    data: issue,
  });
});
/**
 * @desc    Update issue
 * @route   PUT /api/issues/:id
 * @access  Private
 */
export const updateIssue = asyncHandler(async (req, res, next) => {
  let issue = await Issue.findById(req.params.id);

  if (!issue) {
    return next(new AppError('Issue not found', 404));
  }

  // Update issue
  const { title, description, status, priority, assignedTo } = req.body;

  issue = await Issue.findByIdAndUpdate(
    req.params.id,
    {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo !== undefined && { assignedTo }),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  logger.info('Issue updated', { 
    issueId: issue._id, 
    title: issue.title,
    updatedBy: req.user.email 
  });

  res.status(200).json({
    success: true,
    message: 'Issue updated successfully',
    data: issue,
  });
});

/**
 * @desc    Delete issue
 * @route   DELETE /api/issues/:id
 * @access  Private
 */
export const deleteIssue = asyncHandler(async (req, res, next) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return next(new AppError('Issue not found', 404));
  }

  await issue.deleteOne();

  logger.info('Issue deleted', { 
    issueId: issue._id, 
    title: issue.title,
    deletedBy: req.user.email 
  });

  res.status(200).json({
    success: true,
    message: 'Issue deleted successfully',
    data: {},
  });
});

/**
 * @desc    Get issue statistics
 * @route   GET /api/issues/stats
 * @access  Private
 */
export const getIssueStats = asyncHandler(async (req, res, next) => {
  const stats = await Issue.aggregate([
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
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats[0],
  });
});
