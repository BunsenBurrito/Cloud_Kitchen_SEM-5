// Entry point: sets up Express, mounts the routes, connects to the SQL database, starts listening.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { port, nodeEnv, clientUrl } = require('./config');
const { connectDB } = require('./models');
const { notFound, errorHandler } = require('./middleware');

const app = express();

app.use(helmet());                                        // secure HTTP headers
app.use(cors({ origin: clientUrl, credentials: true }));  // allow the React frontend
app.use(express.json({ limit: '10kb' }));                 // parse JSON bodies
if (nodeEnv === 'development') app.use(morgan('dev'));    // request logging

// Basic "is the server up?" messages
app.get('/', (req, res) => res.send('Cloud Kitchen API is running'));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy', uptime: process.uptime() }));

app.use('/api', require('./routes'));

app.use(notFound);     // unknown URL -> 404
app.use(errorHandler); // must be last

connectDB()
  .then(() => app.listen(port, () => console.log(`Server running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
