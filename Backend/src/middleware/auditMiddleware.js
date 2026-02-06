import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to automatically log user actions
 */
export const auditLogger = (action, getDescription) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const description = typeof getDescription === 'function' 
          ? getDescription(req, res, data) 
          : getDescription;

        const metadata = {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
        };

        setImmediate(() => {
          AuditLog.log({
            action,
            user: req.user?._id,
            description,
            targetUser: req.body?.userId || req.params?.userId,
            targetIssue: req.body?.issueId || req.params?.id,
            metadata,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'success',
          }).catch(err => {
            console.error('Audit logging failed:', err);
          });
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Specific audit loggers
 */
export const auditUserLogin = auditLogger(
  'USER_LOGIN',
  (req, res, data) => `User ${data.user?.email} logged in successfully`
);

export const auditUserRegister = auditLogger(
  'USER_REGISTER',
  (req, res, data) => `New user registered: ${data.user?.email}`
);

export const auditIssueCreate = auditLogger(
  'ISSUE_CREATE',
  (req, res, data) => `Issue created: ${data.data?.title} (${data.data?.issueId})`
);

export const auditIssueUpdate = auditLogger(
  'ISSUE_UPDATE',
  (req, res, data) => `Issue updated: ${data.data?.title} (${data.data?.issueId})`
);

export const auditIssueDelete = auditLogger(
  'ISSUE_DELETE',
  (req) => `Issue deleted: ${req.params.id}`
);
