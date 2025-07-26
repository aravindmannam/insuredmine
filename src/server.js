require('dotenv').config();
const express=require('express');
const morgan=require('morgan');
const cors=require('cors');
const routesV1 = require('./routes/apiRoutes');
const mongoconnect=require('./config/mongoose');

const app = express();
//Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin:  '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['x-access-token', 'Authorization', 'Content-Type'],
    credentials: true,
  })
);


//Routes
app.use('/api/v1', routesV1);

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//check for mongoUri environment variable
if (!process.env.URI) {
  console.error('Error: mongoURI environment variable is not defined');
  process.exit(1);
}

//Connect to mongodb
mongoconnect(process.env.URI)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
