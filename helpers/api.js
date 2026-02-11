// helpers/api.js
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// GET request with token
export const fetchWithToken = async ({ queryKey }) => {
  const [endpoint, token] = queryKey;
  const res = await apiClient.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// POST request with FormData
export const postWithToken = async (endpoint, formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// PUT request with FormData
export const putWithToken = async (endpoint, formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// DELETE request with token
export const deleteWithToken = async (endpoint, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};