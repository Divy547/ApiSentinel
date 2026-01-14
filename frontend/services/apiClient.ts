import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const apiClient = axios.create({
  baseURL: API_BASE,
});
