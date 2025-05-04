import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Schema for environment variables
const envSchema = z.object({
  FAKTUROID_ACCOUNT_SLUG: z.string().min(1),
  FAKTUROID_EMAIL: z.string().email(),
  FAKTUROID_API_KEY: z.string().min(1),
  FAKTUROID_APP_NAME: z.string().min(1),
  FAKTUROID_CONTACT_EMAIL: z.string().email(),
  PORT: z.string().optional().transform(val => val ? parseInt(val, 10) : 3456),
});

// Parse environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => err.path.join('.'))
        .join(', ');
      
      console.error(`Error: Missing or invalid environment variables: ${missingVars}`);
      console.error('Please check your .env file or set these environment variables.');
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv(); 