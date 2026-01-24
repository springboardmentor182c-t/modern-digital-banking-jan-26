import { useState } from 'react';

const useVerifyPassword = () => {
  const [isValid, setIsValid] = useState(false);

  const verifyPassword = (password) => {
    // Basic password validation
    const isStrong = password.length >= 8;
    setIsValid(isStrong);
    return isStrong;
  };

  return { verifyPassword, isValid };
};

export default useVerifyPassword;
