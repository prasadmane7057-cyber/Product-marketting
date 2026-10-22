// Unified API Fetch Client for NovaMarket

// Generate or retrieve persistent guest session ID
let guestSessionId = localStorage.getItem('novamarket_session_id');
if (!guestSessionId) {
  guestSessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('novamarket_session_id', guestSessionId);
}

const getHeaders = (isFormData = false) => {
  const headers = {
    'x-session-id': guestSessionId,
  };

  const token = localStorage.getItem('novamarket_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const api = {
  async get(url) {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return this.handleResponse(res);
  },

  async post(url, data, isFormData = false) {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async delete(url) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return this.handleResponse(res);
  },

  async handleResponse(res) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `API error ${res.status}`);
      }
      return data;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP error ${res.status}`);
    }
    return res;
  },
};
