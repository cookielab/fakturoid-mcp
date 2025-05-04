import fetch from 'node-fetch';

// Base URL for Fakturoid API
const BASE_URL = 'https://app.fakturoid.cz/api/v3';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  appName: string;
  contactEmail: string;
}

export class TokenManager {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Get a valid access token, obtaining a new one if needed
   */
  async getToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // Get a new token
    return this.refreshToken();
  }

  /**
   * Force refresh the token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'User-Agent': `${this.config.appName} (${this.config.contactEmail})`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to obtain token: ${response.status} ${response.statusText}, ${errorText}`);
      }

      const data = await response.json() as TokenResponse;
      
      // Store the token and calculate expiry (subtract 5 minutes for safety margin)
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error obtaining OAuth token:', error);
      throw error;
    }
  }
} 