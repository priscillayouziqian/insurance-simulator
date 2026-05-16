// frontend/src/App.jsx
import { useState, useEffect } from 'react';

// --- User Enrollment Form Component ---
function EnrollmentForm() {
  // Define states for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [planType, setPlanType] = useState('Basic Health');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setMessage('Submitting...');
    setIsError(false);

    try {
      // Call our backend API，connecting frontend to backend
      const response = await fetch('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, plan_type: planType }),
      });

      const data = await response.json();

      // Check if backend returned an error (e.g., 403, 404, 409)
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Success scenario: display enrollment ID and status
      setMessage(`Success! Enrollment ID: ${data.enrollment.id} (Status: ${data.enrollment.status})`);
      setIsError(false);
    } catch (err) {
      // Display the error message from backend
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Insurance Enrollment Form</h2>
      <p>Corporate Employee Health Insurance Portal</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Employee Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Plan:</label>
          <select 
            value={planType} 
            onChange={(e) => setPlanType(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Basic Health">Basic Health</option>
            <option value="Premium Health">Premium Health</option>
          </select>
        </div>
        
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>
          Submit Application
        </button>
      </form>

      {/* Message Display Area */}
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: isError ? '#ffe6e6' : '#e6ffe6',
          color: isError ? '#d93025' : '#188038',
          border: `1px solid ${isError ? '#d93025' : '#188038'}`
        }}>
          <strong>{message}</strong>
        </div>
      )}
    </div>
  );
}

// --- Admin Dashboard Component ---
function AdminDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch enrollments when component mounts
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    }
  };

  // Handle status update (Approve/Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/enrollments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setMessage(`Enrollment #${id} marked as ${newStatus}`);
        fetchEnrollments(); // Refresh the list to show updated status
      }
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

// --- Main App Component (Simple Router) ---
function App() {
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'admin'

  return (
    <div>
      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '20px' }}>Insurance System</span>
        <button onClick={() => setCurrentView('user')} style={{ background: 'none', border: 'none', color: currentView === 'user' ? '#4dabf7' : 'white', cursor: 'pointer', fontSize: '16px', fontWeight: currentView === 'user' ? 'bold' : 'normal' }}>Employee Portal</button>
        <button onClick={() => setCurrentView('admin')} style={{ background: 'none', border: 'none', color: currentView === 'admin' ? '#4dabf7' : 'white', cursor: 'pointer', fontSize: '16px', fontWeight: currentView === 'admin' ? 'bold' : 'normal' }}>Admin Dashboard</button>
      </nav>

      {/* Route Rendering */}
      {currentView === 'user' ? <EnrollmentForm /> : <AdminDashboard />}
    </div>
  );
}

export default App;
