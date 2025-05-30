import type { User } from '../models.js';
import { withRetry, request } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getCurrentUser(config: FakturoidClientConfig): Promise<User> {
  return withRetry(() => request<User>(config, '/user.json'));
} 