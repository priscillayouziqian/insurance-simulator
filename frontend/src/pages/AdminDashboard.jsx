import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function AdminDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('enrollments');
  const [message, setMessage] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    fetchEnrollments();
    fetchClaims();
    fetchStats();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await apiService.getEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    }
  };

  const fetchClaims = async () => {
    try {
      const data = await apiService.getAllClaims();
      setClaims(data);
    } catch (error) {
      console.error("Failed to fetch claims", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getClaimStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  // Handle status update (Approve/Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiService.updateEnrollmentStatus(id, newStatus);
      setMessage(`Enrollment #${id} marked as ${newStatus}`);
      fetchEnrollments(); // Refresh the list to show updated status
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Handle claim status update
  const handleClaimStatusChange = async (id, newStatus) => {
    try {
      await apiService.updateClaimStatus(id, newStatus, `Admin marked as ${newStatus}`);
      setMessage(`Claim #${id} marked as ${newStatus}`);
      fetchClaims(); // Refresh the list
      fetchStats(); // Refresh the stats dynamically
    } catch (error) {
      console.error("Failed to update claim status", error);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Admin Dashboard</h2>
      <p>Review and manage employee enrollments and claims</p>

      {/* KPI Stats Cards */}
      {stats && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderLeft: '5px solid #007BFF', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Claims</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.total_claims}</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderLeft: '5px solid #f29900', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Pending Approvals</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.pending_claims}</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderLeft: '5px solid #188038', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Paid Out</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#188038' }}>${stats.total_paid.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <button 
          onClick={() => setActiveTab('enrollments')}
          style={{ padding: '10px 0', cursor: 'pointer', background: 'none', border: 'none', borderBottom: activeTab === 'enrollments' ? '3px solid #007BFF' : '3px solid transparent', fontWeight: activeTab === 'enrollments' ? 'bold' : 'normal', color: activeTab === 'enrollments' ? '#007BFF' : '#333', fontSize: '16px' }}
        >
          Insurance Enrollments
        </button>
        <button 
          onClick={() => setActiveTab('claims')}
          style={{ padding: '10px 0', cursor: 'pointer', background: 'none', border: 'none', borderBottom: activeTab === 'claims' ? '3px solid #007BFF' : '3px solid transparent', fontWeight: activeTab === 'claims' ? 'bold' : 'normal', color: activeTab === 'claims' ? '#007BFF' : '#333', fontSize: '16px' }}
        >
          Reimbursement Claims
        </button>
      </div>

      {message && <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', color: '#188038' }}>{message}</div>}
      
      {/* Conditionally Render Tables based on Active Tab */}
      {activeTab === 'enrollments' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name / Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Plan</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(enrollment => (
              <tr key={enrollment.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{enrollment.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <strong>{enrollment.name}</strong><br/>
                  <small style={{ color: '#666' }}>{enrollment.email}</small>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{enrollment.plan_type}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span style={{ 
                      fontWeight: 'bold', 
                      color: enrollment.status === 'APPROVED' ? '#188038' : enrollment.status === 'REJECTED' ? '#d93025' : '#f29900' 
                  }}>
                      {enrollment.status}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {enrollment.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleStatusChange(enrollment.id, 'APPROVED')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Approve</button>
                      <button onClick={() => handleStatusChange(enrollment.id, 'REJECTED')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Claim ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Employee</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Policy Number</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{claim.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <strong>{claim.user_name}</strong><br/>
                  <small style={{ color: '#666' }}>{claim.user_email}</small>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {claim.policy_number}<br/>
                  <span style={{ fontWeight: 'bold', color: '#007BFF' }}>Total: ${claim.total_amount}</span>
                  <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#555' }}>
                    {claim.items.map((item, idx) => (
                      <li key={idx}>{item.desc} (${item.amt})</li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span style={{ 
                      fontWeight: 'bold', 
                      color: claim.status === 'APPROVED' ? '#188038' : claim.status === 'REJECTED' ? '#d93025' : '#f29900' 
                  }}>
                      {claim.status}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {claim.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleClaimStatusChange(claim.id, 'APPROVED')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Approve</button>
                      <button onClick={() => handleClaimStatusChange(claim.id, 'REJECTED')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
