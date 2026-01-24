import React from 'react';

const RadioButton = ({ label, name, value, onChange, checked, disabled = false }) => {
  return (
    <label>
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      {label}
    </label>
  );
};

export default RadioButton;
