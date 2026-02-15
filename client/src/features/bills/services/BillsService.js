import { fetchBillsAPI } from "./BillsAPI";

export const getBills = async () => {
  const bills = await fetchBillsAPI();
  return bills;
};
