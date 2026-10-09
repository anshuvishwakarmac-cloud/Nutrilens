require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[NutriLens Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('[Server Startup Failure]', err);
  });
