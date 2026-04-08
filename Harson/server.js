import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files
app.use(express.static(join(__dirname, '.')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// 404 handler - serve index.html for any non-existent routes (SPA fallback)
app.use((req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT}`);
});