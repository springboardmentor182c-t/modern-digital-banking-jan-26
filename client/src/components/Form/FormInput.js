import React from 'react';

const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, error, required = false, disabled = false }) => {
  return (
    <div>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span> *</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
};

export default FormInput;
