// src/services/authService.js
import axios from "axios";
import jwtDecode from "jwt-decode";

const API_URL = "http://localhost:5000/api";

export const signup = async (email, password) => {
  return await axios.post(`${API_URL}/register`, { email, password });
};

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  const token = res.data.token;
  if (token) {
    localStorage.setItem("token", token);
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  return jwtDecode(token);
};
 