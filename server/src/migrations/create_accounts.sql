-- Run this SQL manually if the `accounts` table is missing.
-- Adjust users table reference if it's named differently in your DB.

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('Savings','Checking','Credit','Investment')),
  currency VARCHAR(10) DEFAULT 'INR',
  balance NUMERIC(14,2) DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
