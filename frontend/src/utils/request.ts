import { toast } from './toast';
import type { BaseResponse } from '../types';

const BASE_URL = '/api';

export const getToken = () => localStorage.getItem('satoken_value') || '';
export const setToken = (token: string) => localStorage.setItem('satoken_value', token);
export const removeToken = () => localStorage.removeItem('satoken_value');

interface RequestOptions extends RequestInit {
  skipErrorHandler?: boolean;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<BaseResponse<T>> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['satoken'] = token;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers
    });

    const data: BaseResponse<T> = await response.json();

    if (data.code !== 0 && !options.skipErrorHandler) {
      if (data.code === 40100) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } else {
        toast.error(data.message || '请求失败');
      }
    }

    return data;
  } catch (error: unknown) {
    if (!options.skipErrorHandler) {
      toast.error((error as Error).message || '网络错误');
    }
    throw error;
  }
}
