class AppError extends Error {
  constructor(statusCode, message, error = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export { AppError , asyncHandler };