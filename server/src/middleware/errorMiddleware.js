export function notFoundHandler(_request, _response, next) {
  const error = new Error('The requested endpoint was not found.');
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const isClientError = status >= 400 && status < 500;
  const code = error.code || (isClientError ? 'REQUEST_ERROR' : 'INTERNAL_ERROR');
  const message = error.safeMessage || (isClientError
    ? error.message
    : 'An unexpected server error occurred.');

  if (status >= 500) {
    // Avoid logging raw errors, which may contain request or connection details.
    console.error('An unexpected server error occurred.', {
      errorType: typeof error.name === 'string' ? error.name : 'Error',
      errorCode: typeof error.code === 'string' ? error.code : null,
    });
  }

  response.status(status).json({ error: { code, message } });
}
