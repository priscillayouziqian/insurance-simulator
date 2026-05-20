// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EnrollmentForm from './pages/EnrollmentForm';
import AdminDashboard from './pages/AdminDashboard';

// --- Main App Component (Simple Router) ---
function App() {

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '20px' }}>Insurance System</span>
          <Link to="/" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Employee Portal</Link>
          <Link to="/admin" style={{ color: '#4dabf7', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Admin Dashboard</Link>
        </nav>

        {/* Route Rendering */}
        <Routes>
          <Route path="/" element={<EnrollmentForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
