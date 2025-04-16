/**
 * Standard error classes for consistent error handling across all API clients
 */
/**
 * Base class for all API client errors
 */
export class ApiError extends Error {
    code;
    statusCode;
    originalError;
    constructor(message, code = "UNKNOWN_ERROR", statusCode, originalError) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = this.constructor.name;
        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    /**
     * Returns a JSON representation of the error
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
        };
    }
}
/**
 * Error thrown when a network request fails
 */
export class NetworkError extends ApiError {
    constructor(message, originalError) {
        super(message, "NETWORK_ERROR", undefined, originalError);
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends ApiError {
    constructor(message, statusCode, originalError) {
        super(message, "AUTHENTICATION_ERROR", statusCode, originalError);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
/**
 * Error thrown when the API returns a rate limit error
 */
export class RateLimitError extends ApiError {
    resetTimestamp;
    constructor(message, resetTimestamp, statusCode, originalError) {
        super(message, "RATE_LIMIT_ERROR", statusCode, originalError);
        this.resetTimestamp = resetTimestamp;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
    /**
     * Returns a JSON representation of the error
     */
    toJSON() {
        return {
            ...super.toJSON(),
            resetTimestamp: this.resetTimestamp,
        };
    }
}
/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends ApiError {
    constructor(message, statusCode, originalError) {
        super(message, "NOT_FOUND_ERROR", statusCode, originalError);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
/**
 * Error thrown when the API returns a validation error
 */
export class ValidationError extends ApiError {
    validationErrors;
    constructor(message, validationErrors, statusCode, originalError) {
        super(message, "VALIDATION_ERROR", statusCode, originalError);
        this.validationErrors = validationErrors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    /**
     * Returns a JSON representation of the error
     */
    toJSON() {
        return {
            ...super.toJSON(),
            validationErrors: this.validationErrors,
        };
    }
}
/**
 * Error thrown when an operation is unsupported
 */
export class UnsupportedError extends ApiError {
    constructor(message, originalError) {
        super(message, "UNSUPPORTED_ERROR", undefined, originalError);
        Object.setPrototypeOf(this, UnsupportedError.prototype);
    }
}
/**
 * Helper function to handle errors consistently across client modules
 * @param error The error to process
 * @param context Additional context about where the error occurred
 * @returns An ApiError instance
 */
export function handleClientError(error, context) {
    // Return as is if it's already an ApiError
    if (error instanceof ApiError) {
        return error;
    }
    // Axios error handling
    if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error;
        const statusCode = axiosError.response?.status;
        const data = axiosError.response?.data;
        const message = axiosError.message || "API request failed";
        // Handle common HTTP status codes
        if (statusCode) {
            if (statusCode === 401 || statusCode === 403) {
                return new AuthenticationError(`Authentication failed in ${context}: ${message}`, statusCode, axiosError);
            }
            if (statusCode === 404) {
                return new NotFoundError(`Resource not found in ${context}: ${message}`, statusCode, axiosError);
            }
            if (statusCode === 429) {
                const resetTimestamp = axiosError.response?.headers?.["x-ratelimit-reset"]
                    ? parseInt(axiosError.response.headers["x-ratelimit-reset"], 10) *
                        1000
                    : undefined;
                return new RateLimitError(`Rate limit exceeded in ${context}: ${message}`, resetTimestamp, statusCode, axiosError);
            }
            if (statusCode >= 400 && statusCode < 500) {
                if (data && typeof data === "object" && "errors" in data) {
                    return new ValidationError(`Validation failed in ${context}: ${message}`, data.errors, statusCode, axiosError);
                }
            }
        }
        // Network errors
        if (!axiosError.response) {
            return new NetworkError(`Network error in ${context}: ${message}`, axiosError);
        }
        // Default error with status code if available
        return new ApiError(`API error in ${context}: ${message}`, "API_ERROR", statusCode, axiosError);
    }
    // Standard Error objects
    if (error instanceof Error) {
        return new ApiError(`Error in ${context}: ${error.message}`, "UNKNOWN_ERROR", undefined, error);
    }
    // Unknown errors
    return new ApiError(`Unknown error in ${context}: ${String(error)}`, "UNKNOWN_ERROR");
}
