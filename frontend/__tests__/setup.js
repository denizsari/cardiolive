import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />;
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Global test utilities
global.mockApiResponse = (data, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
  timestamp: new Date().toISOString()
});

global.mockPaginatedResponse = (items, page = 1, total = null) => ({
  success: true,
  data: {
    [typeof items[0] === 'object' && items[0].constructor.name.toLowerCase() + 's']: items,
    pagination: {
      page,
      pages: Math.ceil((total || items.length) / 10),
      total: total || items.length,
      limit: 10
    }
  }
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
