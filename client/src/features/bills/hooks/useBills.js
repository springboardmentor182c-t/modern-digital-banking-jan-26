import { useEffect, useState } from "react";
import { getBills } from "./BillsService";

export function useBills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    getBills().then(setBills);
  }, []);

  return { bills };
}
