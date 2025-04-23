const express = require('express');
// Load environment variables first
require('dotenv').config();
const connectDB = require('./config/db');
const cors = require('cors');
const { swaggerUi, swaggerDocs } = require('./swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to Kigali Luxury Cars API');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});