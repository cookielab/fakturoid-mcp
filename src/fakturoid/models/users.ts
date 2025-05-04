// Users
export interface User {
  id: number;
  name: string;
  email: string;
  full_name: string;
  subdomain: string;
  updated_at: string;
  features?: {
    full_api_access?: boolean;
    expenses?: boolean;
    inventory?: boolean;
  };
} 