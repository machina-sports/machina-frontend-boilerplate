import axios, { type AxiosRequestConfig } from 'axios';

type FetchOptions = AxiosRequestConfig & { body?: unknown };

class ClientBaseController {
  async fetch(url: string, options: FetchOptions) {
    try {
      const requestOp: FetchOptions = { ...options };
      requestOp.headers = options.headers ?? {};
      requestOp.params = options.params ?? {};
      requestOp.validateStatus = options.validateStatus ?? undefined;

      const isFormData =
        requestOp.body instanceof FormData ||
        (requestOp.body &&
          typeof requestOp.body === 'object' &&
          requestOp.body.constructor &&
          (requestOp.body.constructor.name === 'FormData' ||
            Object.prototype.toString.call(requestOp.body) === '[object FormData]'));

      if (!requestOp.headers['Content-Type'] && !isFormData) {
        requestOp.headers['Content-Type'] = 'application/json';
      }

      const { headers, body, method, params } = requestOp;

      const response = await axios({
        url,
        headers,
        data: body,
        method,
        params,
      });

      return response ? response.data : null;
    } catch (error: any) {
      if (error?.response) {
        throw error.response.data;
      }
      console.error('Network or axios error:', error?.message);
      throw new Error('Failed to connect to the server');
    }
  }

  get<T = any>(url: string, options: FetchOptions) {
    return this.fetch(url, { ...options, method: 'GET' }) as Promise<T>;
  }

  patch<T = any>(url: string, body: unknown, options: FetchOptions) {
    return this.fetch(url, { ...options, method: 'PATCH', body }) as Promise<T>;
  }

  post<T = any>(url: string, body: unknown, options: FetchOptions = {}) {
    return this.fetch(url, { ...options, method: 'POST', body }) as Promise<T>;
  }

  put<T = any>(url: string, body: unknown, options: FetchOptions = {}) {
    return this.fetch(url, { ...options, method: 'PUT', body }) as Promise<T>;
  }

  delete<T = any>(url: string, body: unknown = {}) {
    return this.fetch(url, { method: 'DELETE', body }) as Promise<T>;
  }
}

export default new ClientBaseController();
