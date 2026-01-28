import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
