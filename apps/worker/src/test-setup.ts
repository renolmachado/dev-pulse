// Jest setup file to load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from the worker app directory
config({ path: resolve(__dirname, '../.env') });

// Also try loading from project root if worker .env doesn't exist
config({ path: resolve(__dirname, '../../../.env') });
