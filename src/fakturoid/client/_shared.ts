import fetch from 'node-fetch';
import { z } from 'zod';

export const BASE_URL = 'https://app.fakturoid.cz/api/v3';

export interface FakturoidClientConfig {
  accountSlug: string;
  email: string;
  apiKey: string;
  appName: string;
  contactEmail: string;
}

export const ErrorResponseSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

export function getHeaders(config: FakturoidClientConfig, contentType = true): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': `${config.appName} (${config.contactEmail})`,
    'Authorization': `Basic ${Buffer.from(`${config.email}:${config.apiKey}`).toString('base64')}`,
  };
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export function accountEndpoint(config: FakturoidClientConfig, path: string): string {
  return `/accounts/${config.accountSlug}${path}`;
}

export async function request<T>(
  config: FakturoidClientConfig,
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  queryParams?: Record<string, string>
): Promise<T> {
  let url = `${BASE_URL}${endpoint}`;
  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  const options: any = {
    method,
    headers: getHeaders(config, !!data),
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    if (isJson) {
      const errorData = ErrorResponseSchema.parse(body);
      if (errorData.error && errorData.error_description) {
        throw new Error(`${errorData.error}: ${errorData.error_description}`);
      } else if (errorData.errors) {
        const messages = Object.entries(errorData.errors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ');
        throw new Error(`Validation error: ${messages}`);
      }
    }
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  return body as T;
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (
        retries < maxRetries &&
        error.message?.includes('429 Too Many Requests')
      ) {
        const delay = Math.pow(2, retries) * 1000;
        console.warn(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
} 