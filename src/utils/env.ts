import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Check if running from Claude or similar AI assistant
const isRunningFromClaudeOrAI = 
  process.env.AI_RUNTIME === 'true' ||
  process.argv.includes('--ai-runtime') ||
  (process.env.FAKTUROID_CLIENT_ID && process.env.FAKTUROID_ACCOUNT_SLUG);

// Log a debug message about environment mode
if (isDevelopment || process.env.DEBUG) {
  console.error(`Environment mode: ${isDevelopment ? 'development' : 'production'}`);
  console.error(`Claude/AI runtime detected: ${isRunningFromClaudeOrAI ? 'yes' : 'no'}`);
}

// Schema for environment variables
const envSchema = z.object({
  FAKTUROID_ACCOUNT_SLUG: (isDevelopment && !isRunningFromClaudeOrAI)
    ? z.string().default('development-account') 
    : z.string().min(1),
  FAKTUROID_CLIENT_ID: (isDevelopment && !isRunningFromClaudeOrAI)
    ? z.string().default('dev-client-id') 
    : z.string().min(1),
  FAKTUROID_CLIENT_SECRET: (isDevelopment && !isRunningFromClaudeOrAI)
    ? z.string().default('dev-client-secret') 
    : z.string().min(1),
  FAKTUROID_APP_NAME: (isDevelopment && !isRunningFromClaudeOrAI)
    ? z.string().default('Fakturoid MCP Dev') 
    : z.string().min(1),
  FAKTUROID_CONTACT_EMAIL: (isDevelopment && !isRunningFromClaudeOrAI)
    ? z.string().email().default('dev-contact@example.com') 
    : z.string().email(),
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
      
      if (!isDevelopment && !isRunningFromClaudeOrAI) {
        process.exit(1);
      } else {
        console.warn('Running in development mode with fallback values. DO NOT USE IN PRODUCTION!');
      }
    }
    
    // In development, return defaults even if validation fails
    if (isDevelopment) {
      return {
        FAKTUROID_ACCOUNT_SLUG: process.env.FAKTUROID_ACCOUNT_SLUG || 'development-account',
        FAKTUROID_CLIENT_ID: process.env.FAKTUROID_CLIENT_ID || 'dev-client-id',
        FAKTUROID_CLIENT_SECRET: process.env.FAKTUROID_CLIENT_SECRET || 'dev-client-secret',
        FAKTUROID_APP_NAME: process.env.FAKTUROID_APP_NAME || 'Fakturoid MCP Dev',
        FAKTUROID_CONTACT_EMAIL: process.env.FAKTUROID_CONTACT_EMAIL || 'dev-contact@example.com',
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3456
      };
    }
    
    throw error;
  }
};

export const env = parseEnv(); 