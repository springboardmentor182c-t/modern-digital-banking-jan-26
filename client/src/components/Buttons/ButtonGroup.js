import React from 'react';

const ButtonGroup = ({ children, className = '' }) => {
  return <div className={`button-group ${className}`}>{children}</div>;
};

export default ButtonGroup;
