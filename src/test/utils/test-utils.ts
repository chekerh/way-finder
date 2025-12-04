/**
 * Test Utilities
 * Provides common test helpers, mock factories, and utilities for unit and E2E tests
 */

import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

/**
 * Creates a mock Mongoose model for testing
 */
export function createMockModel<T>(): jest.Mocked<Model<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    populate: jest.fn(),
    exec: jest.fn(),
    lean: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    select: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn(),
  } as any;
}

/**
 * Mock user factory for testing
 */
export function createMockUser(overrides?: Partial<any>): any {
  return {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    password: 'hashedpassword',
    status: 'active',
    profile_image_url: null,
    onboarding_completed: false,
    onboarding_preferences: {},
    preferences: [],
    fcm_tokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock booking factory for testing
 */
export function createMockBooking(overrides?: Partial<any>): any {
  return {
    _id: '507f1f77bcf86cd799439012',
    user_id: '507f1f77bcf86cd799439011',
    status: 'pending',
    total_price: 500,
    currency: 'EUR',
    booking_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock JWT payload factory
 */
export function createMockJwtPayload(overrides?: Partial<any>): any {
  return {
    sub: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

/**
 * Creates a mock request object with JWT user
 */
export function createMockRequest(userId?: string): any {
  return {
    user: createMockJwtPayload({ sub: userId || '507f1f77bcf86cd799439011' }),
    headers: {},
    body: {},
    query: {},
    params: {},
  };
}

/**
 * Helper to get model token for NestJS testing module
 */
export function getMockModelToken(modelName: string): string {
  return getModelToken(modelName);
}

/**
 * Common test database setup helper
 */
export async function setupTestDatabase(): Promise<void> {
  // Placeholder for test database setup
  // In actual implementation, this would connect to a test database
}

/**
 * Common test database teardown helper
 */
export async function teardownTestDatabase(): Promise<void> {
  // Placeholder for test database teardown
  // In actual implementation, this would clean up test database
}

/**
 * Wait helper for async operations in tests
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
