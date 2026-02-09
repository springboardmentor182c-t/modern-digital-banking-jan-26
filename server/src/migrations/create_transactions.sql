-- Run this SQL manually if the `transactions` table is missing.
-- Adjust users table reference if it's named differently in your DB.

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(10) NOT NULL CHECK (type IN ('debit','credit')),
  amount NUMERIC(14,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('completed','pending')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
