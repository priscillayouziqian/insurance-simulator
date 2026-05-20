import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function AdminDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch enrollments when component mounts
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await apiService.getEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
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

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Admin Dashboard</h2>
      <p>Review and manage employee enrollments</p>
      {message && <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', color: '#188038' }}>{message}</div>}
      
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
    </div>
  );
}
