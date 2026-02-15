import { useEffect, useState } from "react";
import { getTransactions } from "../services/TransactionsService";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);
  return { transactions };
}
