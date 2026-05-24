import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function ClaimsDashboard() {
  const [claims, setClaims] = useState([]);
  const [searchInput, setSearchInput] = useState(''); // Tracks what user is typing
  const [appliedSearch, setAppliedSearch] = useState(''); // Tracks what user actually searched for
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      // Fetch all claims from backend
      const data = await apiService.getAllClaims();
      setClaims(data);
    } catch (err) {
      setError('Failed to load claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle when the search button is clicked
  const handleSearch = () => {
    setAppliedSearch(searchInput);
  };

  // Filter claims based on the applied search state
  const filteredClaims = claims.filter(claim => 
    claim.user_email.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  return (
    <div className="card" style={{ maxWidth: '900px', margin: 'auto' }}>
      <h2>My Claims Dashboard</h2>
      <p style={{ color: '#666' }}>Track the status of your submitted health claims.</p>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filter by Email:</label>
        <input 
          type="text" 
          placeholder="e.g. alice (or alice@company.com)" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={handleSearch} 
          style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p>Loading claims...</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Claim ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Policy Number</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length > 0 ? filteredClaims.map(claim => (
              <tr key={claim.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{claim.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(claim.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{claim.policy_number}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: claim.status === 'PENDING' ? '#f29900' : '#188038' }}>
                  {claim.status}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No claims found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}