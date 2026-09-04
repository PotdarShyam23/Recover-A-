import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env reliably whether started from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import { connectDB } from './db/connection.js';

const PORT = process.env.PORT || 4001;

async function startServer() {
  // Start listening immediately so server is available in < 100ms
  app.listen(PORT, () => {
    console.log(`\n🚀 [RecoverAI] Backend running on http://localhost:${PORT}`);
    console.log(`📡 [API Endpoints] Ready at http://localhost:${PORT}/api`);
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🤖 [AI Multi-Agent] Running in contextual fallback mode. Add GEMINI_API_KEY to .env for live Gemini reasoning.');
    } else {
      console.log('✨ [AI Multi-Agent] Live Gemini model active:', process.env.GEMINI_MODEL || 'gemini-3.6-flash');
    }
  });

  // Connect to MongoDB in background without blocking server startup
  connectDB().catch(err => console.warn('MongoDB connect note:', err.message));
}

startServer();
