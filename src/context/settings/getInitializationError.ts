export const getInitializationError = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An error occurred.';
};
