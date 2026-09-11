import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the .env file relative to this file's location
// This ensures it works regardless of the current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
