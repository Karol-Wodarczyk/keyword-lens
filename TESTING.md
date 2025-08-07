# Testing Documentation

This project uses **Vitest** with **React Testing Library** for unit and integration testing.

## Test Structure

```
src/test/
├── components/          # Component tests
│   ├── ImageViewer.test.tsx
│   └── SearchAndFilter.test.tsx
├── hooks/              # Hook tests  
│   └── useKeywords.test.tsx
├── integration/        # Integration tests
│   └── DataTab.test.tsx
├── lib/                # Utility tests
│   └── utils.test.ts
├── services/           # Service layer tests
│   └── mockApi.test.ts
├── test-providers.tsx  # Test wrapper components
└── utils.tsx          # Custom test utilities
```

## Test Configuration

- **Framework**: Vitest with jsdom environment
- **Testing Library**: React Testing Library for component testing
- **Mocking**: Vi mocks for API clients and hooks
- **Setup**: Custom test utils with React Router and Toast providers

## Available Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with UI (browser interface)
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/test/lib/utils.test.ts
```

## Test Categories

### 1. Unit Tests

**Utilities** (`src/test/lib/utils.test.ts`)
- Tests the `cn` className utility function
- Validates Tailwind CSS class merging
- ✅ All 6 tests passing

**Service Layer** (`src/test/services/mockApi.test.ts`) 
- Tests mock API client functionality
- Validates data transformation and API contracts
- Tests keyword retrieval, frame operations, and album management
- ✅ All 17 tests passing

**Custom Hooks** (`src/test/hooks/useKeywords.test.tsx`)
- Tests keyword management hook
- Validates loading states and error handling
- Tests keyword transformation from API to UI format

### 2. Component Tests

**SearchAndFilter** (`src/test/components/SearchAndFilter.test.tsx`)
- Tests keyword filtering and selection
- Validates occurrence level filtering 
- Tests search functionality and bulk operations

**ImageViewer** (`src/test/components/ImageViewer.test.tsx`)
- Tests image display and keyword management
- Validates modal interactions and keyboard handling
- Tests keyword editing and deletion

### 3. Integration Tests

**DataTab** (`src/test/integration/DataTab.test.tsx`)
- Tests main application component integration
- Validates component composition and data flow
- Tests loading states and user interactions

## Mock Strategy

The tests use a comprehensive mocking approach:

- **API Client**: Uses `mockApiClient` with realistic test data
- **Hooks**: Mocked to provide controlled data for component tests
- **Browser APIs**: Global mocks for IntersectionObserver, ResizeObserver, etc.

## Test Data

The mock API provides:
- 16 keywords with realistic occurrence levels (high/medium/low)
- 100+ frame metadata entries
- 586 frame-keyword relationships
- Configuration and album data for testing

## Current Status

✅ **Passing Tests**: 30 tests across utilities, services, and basic components  
⚠️ **In Progress**: Component integration tests (some failing due to complex UI interactions)
📋 **TODO**: Add more integration tests and E2E test coverage

## Adding New Tests

### Component Test Template

```tsx
import { render, screen, fireEvent } from '@/test/utils'
import { describe, it, expect, vi } from 'vitest'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Hook Test Template

```tsx
import { renderHook, act } from '@/test/utils'
import { describe, it, expect } from 'vitest'
import { useYourHook } from '@/hooks/useYourHook'

describe('useYourHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useYourHook())
    expect(result.current.value).toBe(expectedValue)
  })
})
```

## Best Practices

1. **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
2. **Test behavior, not implementation**: Focus on user interactions
3. **Mock external dependencies**: API calls, complex hooks
4. **Use waitFor for async operations**: Don't rely on timeouts
5. **Keep tests focused**: One concept per test

## Troubleshooting

### Common Issues

1. **"Element not found"**: Check if component is rendering correctly, use `screen.debug()`
2. **"Act warning"**: Wrap state updates in `act()` or use `waitFor`
3. **"Not wrapped in Router"**: Ensure test uses custom render function with providers
4. **Mock not working**: Verify mock is imported before component import
