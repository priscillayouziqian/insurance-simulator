// frontend/src/App.jsx
import { useState } from 'react';

function App() {
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
      // Call our backend API
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

export default App;
