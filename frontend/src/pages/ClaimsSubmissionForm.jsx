import { useState } from 'react';
import { apiService } from '../services/api';

export default function ClaimsSubmissionForm() {
  const [email, setEmail] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  // Initialize items with one empty row
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // --- Dynamic Array Handlers ---
  const handleAddItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  // ------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Convert string amounts to numbers before sending
      const formattedItems = items.map(item => ({
        description: item.description,
        amount: parseFloat(item.amount)
      }));

      const payload = {
        email,
        policy_number: policyNumber,
        items: formattedItems
      };

      const response = await apiService.submitClaim(payload);
      setMessage(response.message);
      
      // Reset form on success
      setEmail('');
      setPolicyNumber('');
      setItems([{ description: '', amount: '' }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit a Health Insurance Claim</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Fill out your policy details and add your claim items below.</p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Policy Number:</label>
          <input 
            type="text" 
            value={policyNumber} 
            onChange={(e) => setPolicyNumber(e.target.value)} 
            placeholder="e.g. POL-123456"
            required 
          />
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h3>Claim Items</h3>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Description (e.g., Dental Checkup)" 
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                style={{ flex: 2 }}
                required
              />
              <input 
                type="number" 
                step="0.01"
                placeholder="Amount ($)" 
                value={item.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                style={{ flex: 1 }}
                required
              />
              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} style={{ backgroundColor: '#ff4d4f', padding: '10px' }}>X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddItem} style={{ backgroundColor: '#fff', color: '#0066cc', border: '1px solid #0066cc', marginTop: '10px' }}>
            + Add Another Item
          </button>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '30px', width: '100%' }}>
          {loading ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
}