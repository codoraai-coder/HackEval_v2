class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong", // this is not good,
    errors = [],
    statck = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.errors = errors;
    this.status = false;
    this.errors = errors;

    if (statck) {
      this.stack = statck;
    } else {
      Error.captureStackTrace(this, this.stack);
    }
  }
}

export { ApiError };
