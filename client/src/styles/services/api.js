const BASE_URL = "http://127.0.0.1:8000";

export const createUser = async (formData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return res.json();
};

export const verifyOTP = async (userId, otp) => {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, otp }),
  });
  return res.json();
};

export const uploadIdentity = async (userId, file) => {
  const data = new FormData();
  data.append("user_id", String(userId));
  data.append("file", file);
  const res = await fetch(`${BASE_URL}/kyc/identity`, {
    method: "POST",
    body: data,
  });
  return res.json();
};

export const uploadAddress = async (userId, form) => {
  const data = new FormData();
  data.append("user_id", String(userId));
  data.append("street", form.street);
  data.append("city", form.city);
  data.append("state", form.state);
  data.append("zip_code", form.zip);
  data.append("file", form.file);
  const res = await fetch(`${BASE_URL}/kyc/address`, {
    method: "POST",
    body: data,
  });
  return res.json();
};
