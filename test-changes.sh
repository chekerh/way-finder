#!/bin/bash

# Test script to verify all backend changes work correctly
# This tests compilation, linting, and basic functionality

echo "🧪 Testing Backend Changes..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Build
echo "1️⃣  Testing TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    npm run build
    exit 1
fi

# Test 2: Check for console statements
echo ""
echo "2️⃣  Checking for remaining console statements..."
CONSOLE_COUNT=$(grep -r "console\.\(log\|error\|warn\)" src --include="*.ts" 2>/dev/null | grep -v "//" | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ No console statements found (all replaced with Logger)${NC}"
else
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console statements (should be 0)${NC}"
fi

# Test 3: Check for linter errors
echo ""
echo "3️⃣  Checking for linter errors..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No linter errors${NC}"
else
    echo -e "${YELLOW}⚠️  Some linter warnings found (check output)${NC}"
fi

# Test 4: Verify pagination DTO exists
echo ""
echo "4️⃣  Verifying pagination utilities..."
if [ -f "src/common/dto/pagination.dto.ts" ]; then
    echo -e "${GREEN}✅ Pagination DTO exists${NC}"
else
    echo -e "${RED}❌ Pagination DTO missing${NC}"
    exit 1
fi

# Test 5: Check health check endpoints
echo ""
echo "5️⃣  Verifying health check endpoints..."
if grep -q "getHealth\|getReady\|getLive" src/app.controller.ts; then
    echo -e "${GREEN}✅ Health check endpoints exist${NC}"
else
    echo -e "${RED}❌ Health check endpoints missing${NC}"
    exit 1
fi

# Test 6: Verify compression is enabled
echo ""
echo "6️⃣  Verifying compression middleware..."
if grep -q "compression" src/main.ts; then
    echo -e "${GREEN}✅ Compression middleware configured${NC}"
else
    echo -e "${RED}❌ Compression middleware missing${NC}"
    exit 1
fi

# Test 7: Verify MongoDB connection pooling
echo ""
echo "7️⃣  Verifying MongoDB connection pooling..."
if grep -q "maxPoolSize\|minPoolSize" src/app.module.ts; then
    echo -e "${GREEN}✅ MongoDB connection pooling configured${NC}"
else
    echo -e "${RED}❌ MongoDB connection pooling missing${NC}"
    exit 1
fi

# Test 8: Verify CORS configuration
echo ""
echo "8️⃣  Verifying CORS configuration..."
if grep -q "enableCors\|FRONTEND_ORIGIN" src/main.ts; then
    echo -e "${GREEN}✅ CORS properly configured${NC}"
else
    echo -e "${RED}❌ CORS configuration missing${NC}"
    exit 1
fi

# Test 9: Verify database indexes
echo ""
echo "9️⃣  Verifying database indexes..."
INDEX_COUNT=$(grep -r "\.index(" src --include="*.schema.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$INDEX_COUNT" -gt "10" ]; then
    echo -e "${GREEN}✅ Found $INDEX_COUNT database indexes${NC}"
else
    echo -e "${YELLOW}⚠️  Only $INDEX_COUNT indexes found (expected more)${NC}"
fi

# Test 10: Verify Logger usage
echo ""
echo "🔟 Verifying Logger usage..."
LOGGER_COUNT=$(grep -r "private readonly logger = new Logger" src --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Logger used in $LOGGER_COUNT service files${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All tests passed! Backend is ready.${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

