const IssuesTable = ({ issues, onEdit, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Open: 'badge-open',
      'In Progress': 'badge-in-progress',
      Closed: 'badge-closed',
    };
    return `badge ${statusMap[status] || 'badge-open'}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      Low: 'badge-low',
      Medium: 'badge-medium',
      High: 'badge-high',
    };
    return `badge ${priorityMap[priority] || 'badge-medium'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (issues.length === 0) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>
            No issues found. Create your first issue to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned To</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue._id}>
              <td>
                <code style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.875rem',
                  color: 'var(--color-secondary)'
                }}>
                  {issue.issueId || issue._id.slice(-6).toUpperCase()}
                </code>
              </td>
              <td>
                <div style={{ maxWidth: '300px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    {issue.title}
                  </div>
                  <div className="text-muted" style={{ 
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {issue.description}
                  </div>
                </div>
              </td>
              <td>
                <span className={getStatusBadgeClass(issue.status)}>
                  {issue.status}
                </span>
              </td>
              <td>
                <span className={getPriorityBadgeClass(issue.priority)}>
                  {issue.priority}
                </span>
              </td>
              <td>{issue.assignedTo || '-'}</td>
              <td style={{ fontSize: '0.875rem' }}>
                {formatDate(issue.createdAt)}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onEdit(issue)}
                    className="btn btn-secondary btn-sm"
                    title="Edit issue"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(issue._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete issue"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesTable;
