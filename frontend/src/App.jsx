// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EnrollmentForm from './pages/EnrollmentForm';
import AdminDashboard from './pages/AdminDashboard';
import ClaimsSubmissionForm from './pages/ClaimsSubmissionForm';
import ClaimsDashboard from './pages/ClaimsDashboard';

// --- Main App Component (Simple Router) ---
function App() {

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '20px' }}>Insurance System</span>
          <Link to="/" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Employee Portal</Link>
          <Link to="/submit-claim" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Submit Claim</Link>
          <Link to="/my-claims" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>My Claims</Link>
          <Link to="/admin" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Admin Dashboard</Link>
        </nav>

        {/* Route Rendering */}
        <Routes>
          <Route path="/" element={<EnrollmentForm />} />
          <Route path="/submit-claim" element={<ClaimsSubmissionForm />} />
          <Route path="/my-claims" element={<ClaimsDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
