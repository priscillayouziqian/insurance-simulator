import { useState } from 'react';
import { apiService } from '../services/api';

export default function EnrollmentForm() {
  // Define states for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [planType, setPlanType] = useState('Basic Health');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [explanation, setExplanation] = useState(null);   // AI plain-language explanation
  const [explaining, setExplaining] = useState(false);    // loading state for the explainer

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setMessage('Submitting...');
    setIsError(false);
    setExplanation(null);   // clear any explanation from a previous attempt

    try {
      // Call our centralized API service
      const data = await apiService.submitEnrollment({ email, plan_type: planType });

      // Success scenario: display enrollment ID and status
      setMessage(`Success! Enrollment ID: ${data.enrollment.id} (Status: ${data.enrollment.status})`);
      setIsError(false);
    } catch (err) {
      // Display the error message from backend
      setIsError(true);
      setMessage(err.message);
    }
  };

  // Ask the AI to explain the current error message in plain language
  const handleExplain = async () => {
    setExplaining(true);
    try {
      const result = await apiService.explainSituation({ situation: message });
      setExplanation(result);
    } catch (err) {
      setExplanation({ explanation: err.message, nextSteps: [] });
    } finally {
      setExplaining(false);
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

      {/* Plain-language explainer: only offered when the submission was rejected */}
      {isError && (
        <div style={{ marginTop: '15px' }}>
          <button
            onClick={handleExplain}
            disabled={explaining}
            style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#4dabf7', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {explaining ? 'Explaining…' : '💬 Explain this in plain language'}
          </button>

          {explanation && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#eef6ff', border: '1px solid #4dabf7', borderRadius: '5px' }}>
              <p style={{ marginTop: 0 }}>{explanation.explanation}</p>
              {explanation.nextSteps?.length > 0 && (
                <>
                  <strong>Next steps:</strong>
                  <ul style={{ marginBottom: 0 }}>
                    {explanation.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
