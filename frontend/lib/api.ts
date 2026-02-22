import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchPortfolio() {
  const { data } = await axios.get(`${API}/api/portfolio`);
  return data;
}

export async function refreshPortfolio() {
  await axios.get(`${API}/portfolio/refresh`);
  const { data } = await axios.get(`${API}/portfolio`);
  return data;
}
