// API utility functions
export const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const get = (url: string) => apiRequest(url);
export const post = (url: string, data: unknown) => 
  apiRequest(url, { method: 'POST', body: JSON.stringify(data) });
export const put = (url: string, data: unknown) => 
  apiRequest(url, { method: 'PUT', body: JSON.stringify(data) });
export const del = (url: string) => 
  apiRequest(url, { method: 'DELETE' });