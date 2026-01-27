const API_BASE = 'http://98.82.28.184:3001';
const API_KEY = 'workshop-api-key-emery-2024';

export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'X-API-Key': API_KEY },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async put(endpoint: string, data: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async delete(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': API_KEY },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};
