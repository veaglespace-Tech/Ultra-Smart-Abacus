import { storageService } from './storage.services';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = storageService.getToken();
  
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      storageService.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new Error("Unauthorized");
    }
//     if (response.status === 401) {
//   console.log("401 Response");

//   // storageService.clearAuth();
//   // window.location.href = "/auth/login";

//   const data = await response.json();
//   console.log(data);

//   throw new Error(data.message || "Unauthorized");
// }
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
      const errMsg = data.message || data.error || (data.errors ? JSON.stringify(data.errors) : null) || `Request failed with status ${response.status}`;
      throw new Error(errMsg);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export const apiHelper = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
