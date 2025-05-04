import type { Account } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getAccount(config: FakturoidClientConfig): Promise<Account> {
  return withRetry(() => request<Account>(config, accountEndpoint(config, '.json')));
}

export async function updateAccount(config: FakturoidClientConfig, accountData: Partial<Account>): Promise<Account> {
  return withRetry(() => request<Account>(config, accountEndpoint(config, '.json'), 'PATCH', accountData));
} 