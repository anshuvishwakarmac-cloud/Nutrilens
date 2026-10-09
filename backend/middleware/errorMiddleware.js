const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose DB buffering timeout gracefully
  if (message.includes('buffering timed out') || message.includes('ECONNREFUSED') || err.name === 'MongooseError') {
    statusCode = 503;
    message = 'Database Connection Failed: MongoDB is not running on your computer or the MONGODB_URI connection string is invalid. Please start your local MongoDB service or set your MongoDB Atlas connection URL in backend/.env.';
  }

  console.error('[API Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
