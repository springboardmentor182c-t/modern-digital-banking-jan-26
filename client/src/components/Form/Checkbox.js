import React from 'react';

const Checkbox = ({ label, name, value, onChange, checked, disabled = false }) => {
  return (
    <label>
      <input
        type="checkbox"
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

export default Checkbox;
