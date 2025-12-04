# Refactoring Large Service Files

## Overview

This document outlines the refactoring plan for large service files that exceed 500 lines. Breaking these into smaller, focused modules will improve maintainability, testability, and code organization.

---

## Target Files for Refactoring

### Priority 1: Files > 800 lines

1. **`journey.service.ts`** (1105 lines)
   - Split into:
     - `journey-crud.service.ts` - CRUD operations
     - `journey-images.service.ts` - Image upload and management
     - `journey-comments.service.ts` - Comments functionality
     - `journey-likes.service.ts` - Likes functionality

2. **`auth.service.ts`** (1011 lines)
   - Split into:
     - `auth-registration.service.ts` - Registration and email verification
     - `auth-login.service.ts` - Login and OTP
     - `auth-oauth.service.ts` - OAuth (Google) integration
     - `auth-jwt.service.ts` - JWT token management

3. **`ai-video.service.ts`** (892 lines)
   - Split into:
     - `video-generation.service.ts` - Video generation logic
     - `video-editing.service.ts` - Video editing operations
     - `video-storage.service.ts` - Video storage management

### Priority 2: Files 500-800 lines

4. **`social.service.ts`** (799 lines)
   - Split into:
     - `social-follow.service.ts` - Follow/unfollow operations
     - `social-share.service.ts` - Trip sharing
     - `social-feed.service.ts` - Feed generation

5. **`notifications.service.ts`** (687 lines)
   - Split into:
     - `notifications-crud.service.ts` - CRUD operations
     - `notifications-delivery.service.ts` - Delivery logic
     - `notifications-templates.service.ts` - Template management

6. **`onboarding-ai.service.ts`** (645 lines)
   - Split into:
     - `onboarding-ai-processor.service.ts` - AI processing
     - `onboarding-questions.service.ts` - Question generation
     - `onboarding-recommendations.service.ts` - Recommendation logic

---

## Refactoring Strategy

### 1. Extract Related Functionality

**Pattern:**
```typescript
// Before: Large service with multiple responsibilities
@Injectable()
export class JourneyService {
  // CRUD methods
  // Image methods
  // Comment methods
  // Like methods
}

// After: Focused services with single responsibility
@Injectable()
export class JourneyCrudService {
  // Only CRUD operations
}

@Injectable()
export class JourneyImagesService {
  // Only image operations
}

@Injectable()
export class JourneyCommentsService {
  // Only comment operations
}

@Injectable()
export class JourneyLikesService {
  // Only like operations
}
```

### 2. Use Dependency Injection

**Pattern:**
```typescript
@Injectable()
export class JourneyService {
  constructor(
    private readonly crudService: JourneyCrudService,
    private readonly imagesService: JourneyImagesService,
    private readonly commentsService: JourneyCommentsService,
    private readonly likesService: JourneyLikesService,
  ) {}

  // Delegate to specialized services
  async create(dto: CreateJourneyDto) {
    return this.crudService.create(dto);
  }
}
```

### 3. Maintain Backward Compatibility

- Keep existing service as facade/wrapper
- Delegate to specialized services internally
- Maintain existing API contracts
- Update controllers gradually if needed

---

## Implementation Plan

### Phase 1: Journey Service (1105 lines)

**Steps:**
1. Create `journey-crud.service.ts` - Extract CRUD operations
2. Create `journey-images.service.ts` - Extract image operations
3. Create `journey-comments.service.ts` - Extract comment operations
4. Create `journey-likes.service.ts` - Extract like operations
5. Refactor `journey.service.ts` to use new services
6. Update `journey.module.ts` with new providers
7. Add unit tests for each new service

**Estimated Lines per Service:**
- `journey-crud.service.ts`: ~300 lines
- `journey-images.service.ts`: ~250 lines
- `journey-comments.service.ts`: ~250 lines
- `journey-likes.service.ts`: ~200 lines
- `journey.service.ts` (facade): ~100 lines

### Phase 2: Auth Service (1011 lines)

**Steps:**
1. Create `auth-registration.service.ts` - Registration logic
2. Create `auth-login.service.ts` - Login and OTP logic
3. Create `auth-oauth.service.ts` - OAuth logic
4. Create `auth-jwt.service.ts` - JWT management
5. Refactor `auth.service.ts` to use new services
6. Update `auth.module.ts` with new providers
7. Add unit tests for each new service

**Estimated Lines per Service:**
- `auth-registration.service.ts`: ~300 lines
- `auth-login.service.ts`: ~250 lines
- `auth-oauth.service.ts`: ~200 lines
- `auth-jwt.service.ts`: ~150 lines
- `auth.service.ts` (facade): ~100 lines

### Phase 3: Remaining Services

Follow the same pattern for:
- `ai-video.service.ts`
- `social.service.ts`
- `notifications.service.ts`
- `onboarding-ai.service.ts`

---

## Benefits

1. **Maintainability**: Smaller files are easier to understand and modify
2. **Testability**: Focused services are easier to unit test
3. **Reusability**: Smaller services can be reused in different contexts
4. **Separation of Concerns**: Each service has a single responsibility
5. **Code Organization**: Related functionality is grouped together
6. **Team Collaboration**: Multiple developers can work on different services

---

## Testing Strategy

1. **Unit Tests**: Create tests for each new service
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Verify end-to-end functionality still works
4. **Backward Compatibility**: Ensure existing API contracts are maintained

---

## Migration Checklist

For each service refactoring:

- [ ] Create new service files
- [ ] Extract related methods to new services
- [ ] Update module providers
- [ ] Refactor original service to use new services
- [ ] Add unit tests for new services
- [ ] Run existing tests to ensure compatibility
- [ ] Update documentation
- [ ] Code review
- [ ] Deploy and monitor

---

## Notes

- **Gradual Migration**: Refactor one service at a time
- **Backward Compatibility**: Maintain existing API contracts
- **Testing**: Comprehensive testing before and after refactoring
- **Documentation**: Update API documentation after refactoring

---

*Last Updated: 2025-01-27*

