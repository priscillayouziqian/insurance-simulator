// frontend/src/services/api.js

// Read the base URL from the environment variable we just created
// If the environment variable is missing, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiService = {
  // User: Submit a new enrollment
  async submitEnrollment(data) {
    const response = await fetch(`${BASE_URL}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || 'Something went wrong');
    }
    return responseData;
  },

  // Admin: Get all enrollments
  async getEnrollments() {
    const response = await fetch(`${BASE_URL}/enrollments`);
    if (!response.ok) throw new Error('Failed to fetch enrollments');
    return response.json();
  },

  // Admin: Update enrollment status
  async updateEnrollmentStatus(id, status) {
    const response = await fetch(`${BASE_URL}/enrollments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }
};