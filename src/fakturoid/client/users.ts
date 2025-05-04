import type { User } from '../models.js';
import { withRetry, request } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

// Log for debugging
console.log('Users module loaded successfully');

export async function getCurrentUser(config: FakturoidClientConfig): Promise<User> {
  console.log('getCurrentUser called with config:', config.accountSlug);
  return withRetry(() => request<User>(config, '/user.json'));
} 