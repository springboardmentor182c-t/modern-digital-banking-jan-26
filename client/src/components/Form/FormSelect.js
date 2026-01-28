import React from 'react';

const FormSelect = ({ label, name, value, onChange, options = [], error, required = false, disabled = false }) => {
  return (
    <div>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span> *</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  );
};

export default FormSelect;
