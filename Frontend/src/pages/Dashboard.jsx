import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import IssuesTable from '../components/IssuesTable';
import IssueModal from '../components/IssueModal';
import { issuesAPI } from '../services/api';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await issuesAPI.getAll();

      // Ensure we always store an array
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.issues || [];
      setIssues(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
      setIssues([]); // ensure issues is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (issueData) => {
    try {
      const response = await issuesAPI.create(issueData);
      setIssues((prev) => [response.data, ...prev]);
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create issue');
      console.error('Error creating issue:', err);
    }
  };

  const handleUpdateIssue = async (issueData) => {
    try {
      const response = await issuesAPI.update(selectedIssue._id, issueData);
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === selectedIssue._id ? response.data : issue
        )
      );
      setIsModalOpen(false);
      setSelectedIssue(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue');
      console.error('Error updating issue:', err);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      await issuesAPI.delete(issueId);
      setIssues((prev) => prev.filter((issue) => issue._id !== issueId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue');
      console.error('Error deleting issue:', err);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedIssue(null);
    setIsModalOpen(true);
  };

  const openEditModal = (issue) => {
    setModalMode('edit');
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (issueData) => {
    if (modalMode === 'create') {
      handleCreateIssue(issueData);
    } else {
      handleUpdateIssue(issueData);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Safe filtering: only filter if issues is an array
  const filteredIssues = Array.isArray(issues)
    ? issues.filter((issue) => {
        const matchesStatus =
          filters.status === 'all' || issue.status === filters.status;
        const matchesPriority =
          filters.priority === 'all' || issue.priority === filters.priority;
        const matchesSearch =
          filters.search === '' ||
          issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          issue.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          (issue.assignedTo &&
            issue.assignedTo.toLowerCase().includes(filters.search.toLowerCase()));

        return matchesStatus && matchesPriority && matchesSearch;
      })
    : [];

  // Safe stats calculation
  const stats = {
    total: Array.isArray(issues) ? issues.length : 0,
    open: Array.isArray(issues)
      ? issues.filter((i) => i.status === 'Open').length
      : 0,
    inProgress: Array.isArray(issues)
      ? issues.filter((i) => i.status === 'In Progress').length
      : 0,
    closed: Array.isArray(issues)
      ? issues.filter((i) => i.status === 'Closed').length
      : 0,
  };

  return (
    <>
      <Navbar />

      <div
        className="container"
        style={{
          paddingTop: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-2xl)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 'var(--spacing-md)' }}
          >
            <div>
              <h1 style={{ marginBottom: '0.25rem' }}>Issues Dashboard</h1>
              <p className="text-muted">
                Manage and track all your engineering issues
              </p>
            </div>
            <button onClick={openCreateModal} className="btn btn-accent">
              + Create Issue
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginTop: 'var(--spacing-lg)',
            }}
          >
            <div className="card">
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div
                  className="text-muted"
                  style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
                >
                  Total Issues
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                >
                  {stats.total}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div
                  className="text-muted"
                  style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
                >
                  Open
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--color-success)',
                  }}
                >
                  {stats.open}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div
                  className="text-muted"
                  style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
                >
                  In Progress
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--color-warning)',
                  }}
                >
                  {stats.inProgress}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div
                  className="text-muted"
                  style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
                >
                  Closed
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--color-text-light)',
                  }}
                >
                  {stats.closed}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)',
              }}
            >
              <div>
                <label htmlFor="search" className="form-label">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="form-input"
                  placeholder="Search by title, description, assignee..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="form-select"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Issues table */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--spacing-2xl)',
            }}
          >
            <div className="spinner"></div>
          </div>
        ) : (
          <IssuesTable
            issues={filteredIssues}
            onEdit={openEditModal}
            onDelete={handleDeleteIssue}
          />
        )}
      </div>

      {/* Issue Modal */}
      <IssueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIssue(null);
        }}
        onSubmit={handleModalSubmit}
        issue={selectedIssue}
        mode={modalMode}
      />
    </>
  );
};

export default Dashboard;
