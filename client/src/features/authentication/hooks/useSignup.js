import { useState } from 'react';

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (userData) => {
    setLoading(true);
    try {
      // Signup logic here
      console.log('Signing up user:', userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

export default useSignup;
