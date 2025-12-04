/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values for better maintainability
 */

/**
 * Security constants
 */
export const SECURITY = {
  /** Bcrypt salt rounds for password hashing - balance between security and performance */
  BCRYPT_SALT_ROUNDS: 10,

  /** JWT token expiration time */
  JWT_EXPIRATION: '7d',
} as const;

/**
 * OTP (One-Time Password) constants
 */
export const OTP = {
  /** OTP code length in digits */
  CODE_LENGTH: 4,

  /** OTP expiration time in minutes */
  EXPIRATION_MINUTES: 5,

  /** Cooldown period between OTP requests in seconds */
  COOLDOWN_SECONDS: 30,

  /** Maximum number of OTP attempts before rate limiting */
  MAX_ATTEMPTS: 5,
} as const;

/**
 * Pagination constants
 */
export const PAGINATION = {
  /** Default page number (1-based) */
  DEFAULT_PAGE: 1,

  /** Default items per page */
  DEFAULT_LIMIT: 20,

  /** Maximum items per page to prevent excessive data loading */
  MAX_LIMIT: 100,

  /** Default limit for comments */
  DEFAULT_COMMENT_LIMIT: 50,

  /** Maximum limit for comments */
  MAX_COMMENT_LIMIT: 100,
} as const;

/**
 * File upload constants
 */
export const FILE_UPLOAD = {
  /** Maximum file size for profile images in bytes (5MB) */
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024,

  /** Maximum file size for outfit images in bytes (10MB) */
  MAX_OUTFIT_IMAGE_SIZE: 10 * 1024 * 1024,

  /** Maximum file size for journey images in bytes (5MB per image) */
  MAX_JOURNEY_IMAGE_SIZE: 5 * 1024 * 1024,

  /** Maximum number of journey images */
  MAX_JOURNEY_IMAGES: 20,
} as const;

/**
 * Cache TTL (Time To Live) constants in seconds
 */
export const CACHE_TTL = {
  /** Recommended flights cache duration (5 minutes) */
  RECOMMENDED_FLIGHTS: 5 * 60,

  /** Explore offers cache duration (10 minutes) */
  EXPLORE_OFFERS: 10 * 60,

  /** Personalized recommendations cache duration (15 minutes) */
  RECOMMENDATIONS: 15 * 60,

  /** Activities feed cache duration (30 minutes) */
  ACTIVITIES: 30 * 60,

  /** Fallback responses cache duration (10 minutes) */
  FALLBACK: 10 * 60,
} as const;

/**
 * Database query constants
 */
export const DATABASE = {
  /** Maximum connection pool size for production */
  MAX_POOL_SIZE_PROD: 50,

  /** Minimum connection pool size for production */
  MIN_POOL_SIZE_PROD: 5,

  /** Maximum connection pool size for development */
  MAX_POOL_SIZE_DEV: 10,

  /** Minimum connection pool size for development */
  MIN_POOL_SIZE_DEV: 1,

  /** Connection timeout in milliseconds */
  CONNECT_TIMEOUT_MS: 10000,

  /** Socket timeout in milliseconds */
  SOCKET_TIMEOUT_MS: 45000,

  /** Server selection timeout in milliseconds */
  SERVER_SELECTION_TIMEOUT_MS: 10000,

  /** Maximum idle time before closing connection in milliseconds */
  MAX_IDLE_TIME_MS: 30000,

  /** Heartbeat frequency in milliseconds */
  HEARTBEAT_FREQUENCY_MS: 10000,
} as const;

/**
 * Rate limiting constants (requests per minute)
 */
export const RATE_LIMIT = {
  /** Default rate limit for general endpoints */
  DEFAULT: 100,

  /** Strict rate limit for sensitive operations */
  STRICT: 5,

  /** Payment operations rate limit */
  PAYMENT: 10,

  /** Catalog operations rate limit */
  CATALOG: 60,

  /** Authentication endpoints rate limit */
  AUTH: 5,

  /** OTP endpoints rate limit */
  OTP: 3,

  /** File upload rate limit */
  FILE_UPLOAD: 5,

  /** Booking confirmation rate limit */
  BOOKING_CONFIRM: 10,

  /** Discussion post creation rate limit */
  DISCUSSION_POST: 10,

  /** Discussion comment creation rate limit */
  DISCUSSION_COMMENT: 20,

  /** Onboarding operations rate limit */
  ONBOARDING: 5,
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Minimum username length */
  MIN_USERNAME_LENGTH: 3,

  /** Maximum username length */
  MAX_USERNAME_LENGTH: 30,

  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 8,

  /** Maximum title length for posts */
  MAX_TITLE_LENGTH: 200,

  /** Maximum content length for posts */
  MAX_CONTENT_LENGTH: 5000,
} as const;
