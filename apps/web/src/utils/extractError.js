export function extractError(error, fallbackMessage = "Something went wrong") {
  if (!error) {
    return {
      message: fallbackMessage,
      errors: []
    };
  }

  const nestedErrors = error.response?.data?.errors;

  return {
    message: error.response?.data?.message || error.message || fallbackMessage,
    errors: Array.isArray(nestedErrors) ? nestedErrors : []
  };
}
