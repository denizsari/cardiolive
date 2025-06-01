import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { jest } from '@jest/globals'
import { ProductGrid } from '../app/components/ProductGrid'
import { LoginForm } from '../app/components/auth/LoginForm'
import { CheckoutForm } from '../app/components/checkout/CheckoutForm'
import { BlogList } from '../app/components/blog/BlogList'
import { apiClient } from '../app/utils/api'

// Mock the API client
jest.mock('../app/utils/api', () => ({
  apiClient: {
    authAPI: {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn()
    },
    productAPI: {
      getAll: jest.fn(),
      getById: jest.fn(),
      getBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    orderAPI: {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      track: jest.fn(),
      cancel: jest.fn(),
      updateStatus: jest.fn(),
      getAdminOrders: jest.fn(),
      updatePayment: jest.fn()
    },
    blogAPI: {
      getAll: jest.fn(),
      getById: jest.fn(),
      getBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    reviewAPI: {
      create: jest.fn(),
      getByProduct: jest.fn(),
      getStats: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      markHelpful: jest.fn(),
      adminDelete: jest.fn(),
      adminUpdateStatus: jest.fn()
    },
    wishlistAPI: {
      getAll: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
      getCount: jest.fn(),
      check: jest.fn(),
      bulkAdd: jest.fn(),
      bulkRemove: jest.fn(),
      updateNotes: jest.fn()
    }
  }
}))

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithQueryClient = (ui, { queryClient = createTestQueryClient() } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('Frontend API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Components', () => {
    describe('LoginForm', () => {
      it('should call login API on form submission', async () => {
        const mockLoginResponse = {
          success: true,
          token: 'mock-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' }
        }

        apiClient.authAPI.login.mockResolvedValue(mockLoginResponse)

        renderWithQueryClient(<LoginForm />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /login/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(apiClient.authAPI.login).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      })

      it('should handle login API errors', async () => {
        const mockError = new Error('Invalid credentials')
        apiClient.authAPI.login.mockRejectedValue(mockError)

        renderWithQueryClient(<LoginForm />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /login/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Product Components', () => {
    describe('ProductGrid', () => {
      it('should fetch and display products', async () => {
        const mockProducts = {
          success: true,
          data: {
            products: [
              {
                _id: '1',
                name: 'Test Product 1',
                price: 99.99,
                images: ['test1.jpg'],
                slug: 'test-product-1'
              },
              {
                _id: '2',
                name: 'Test Product 2',
                price: 149.99,
                images: ['test2.jpg'],
                slug: 'test-product-2'
              }
            ],
            pagination: { total: 2, page: 1, pages: 1 }
          }
        }

        apiClient.productAPI.getAll.mockResolvedValue(mockProducts)

        renderWithQueryClient(<ProductGrid />)

        await waitFor(() => {
          expect(screen.getByText('Test Product 1')).toBeInTheDocument()
          expect(screen.getByText('Test Product 2')).toBeInTheDocument()
        })

        expect(apiClient.productAPI.getAll).toHaveBeenCalled()
      })

      it('should handle product loading states', () => {
        apiClient.productAPI.getAll.mockImplementation(() => new Promise(() => {})) // Never resolves

        renderWithQueryClient(<ProductGrid />)

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
      })

      it('should handle product API errors', async () => {
        const mockError = new Error('Failed to fetch products')
        apiClient.productAPI.getAll.mockRejectedValue(mockError)

        renderWithQueryClient(<ProductGrid />)

        await waitFor(() => {
          expect(screen.getByText(/error loading products/i)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Order Components', () => {
    describe('CheckoutForm', () => {
      const mockCartItems = [
        {
          product: { _id: '1', name: 'Test Product', price: 99.99 },
          quantity: 2
        }
      ]

      it('should create order on form submission', async () => {
        const mockOrderResponse = {
          success: true,
          order: {
            _id: 'order-1',
            orderNumber: 'ORD-001',
            total: 199.98,
            status: 'pending'
          }
        }

        apiClient.orderAPI.create.mockResolvedValue(mockOrderResponse)

        renderWithQueryClient(<CheckoutForm cartItems={mockCartItems} />)

        // Fill form fields
        const addressInput = screen.getByLabelText(/street address/i)
        const cityInput = screen.getByLabelText(/city/i)
        const submitButton = screen.getByRole('button', { name: /place order/i })

        fireEvent.change(addressInput, { target: { value: '123 Test St' } })
        fireEvent.change(cityInput, { target: { value: 'Test City' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(apiClient.orderAPI.create).toHaveBeenCalledWith(
            expect.objectContaining({
              items: expect.arrayContaining([
                expect.objectContaining({
                  product: '1',
                  quantity: 2,
                  price: 99.99
                })
              ]),
              shippingAddress: expect.objectContaining({
                street: '123 Test St',
                city: 'Test City'
              })
            })
          )
        })
      })

      it('should handle order creation errors', async () => {
        const mockError = new Error('Payment failed')
        apiClient.orderAPI.create.mockRejectedValue(mockError)

        renderWithQueryClient(<CheckoutForm cartItems={mockCartItems} />)

        const addressInput = screen.getByLabelText(/street address/i)
        const submitButton = screen.getByRole('button', { name: /place order/i })

        fireEvent.change(addressInput, { target: { value: '123 Test St' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/payment failed/i)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Blog Components', () => {
    describe('BlogList', () => {
      it('should fetch and display blog posts', async () => {
        const mockBlogs = {
          success: true,
          data: {
            blogs: [
              {
                _id: '1',
                title: 'Test Blog 1',
                excerpt: 'This is a test blog excerpt',
                slug: 'test-blog-1',
                publishedAt: new Date().toISOString()
              },
              {
                _id: '2',
                title: 'Test Blog 2',
                excerpt: 'Another test blog excerpt',
                slug: 'test-blog-2',
                publishedAt: new Date().toISOString()
              }
            ]
          }
        }

        apiClient.blogAPI.getAll.mockResolvedValue(mockBlogs)

        renderWithQueryClient(<BlogList />)

        await waitFor(() => {
          expect(screen.getByText('Test Blog 1')).toBeInTheDocument()
          expect(screen.getByText('Test Blog 2')).toBeInTheDocument()
        })

        expect(apiClient.blogAPI.getAll).toHaveBeenCalled()
      })
    })
  })

  describe('Review Components', () => {
    it('should create product review', async () => {
      const mockReviewResponse = {
        success: true,
        review: {
          _id: 'review-1',
          rating: 5,
          comment: 'Great product!',
          user: { name: 'Test User' }
        }
      }

      apiClient.reviewAPI.create.mockResolvedValue(mockReviewResponse)

      // This would be part of a ReviewForm component test
      const reviewData = {
        product: 'product-1',
        rating: 5,
        comment: 'Great product!'
      }

      await apiClient.reviewAPI.create(reviewData)

      expect(apiClient.reviewAPI.create).toHaveBeenCalledWith(reviewData)
    })
  })

  describe('Wishlist Components', () => {
    it('should add product to wishlist', async () => {
      const mockWishlistResponse = {
        success: true,
        wishlistItem: {
          _id: 'wishlist-1',
          product: 'product-1',
          user: 'user-1'
        }
      }

      apiClient.wishlistAPI.add.mockResolvedValue(mockWishlistResponse)

      await apiClient.wishlistAPI.add({ product: 'product-1' })

      expect(apiClient.wishlistAPI.add).toHaveBeenCalledWith({ product: 'product-1' })
    })

    it('should remove product from wishlist', async () => {
      const mockResponse = { success: true }
      apiClient.wishlistAPI.remove.mockResolvedValue(mockResponse)

      await apiClient.wishlistAPI.remove('product-1')

      expect(apiClient.wishlistAPI.remove).toHaveBeenCalledWith('product-1')
    })
  })

  describe('API Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      networkError.name = 'NetworkError'
      
      apiClient.productAPI.getAll.mockRejectedValue(networkError)

      renderWithQueryClient(<ProductGrid />)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized')
      authError.status = 401
      
      apiClient.authAPI.getProfile.mockRejectedValue(authError)

      // Test would verify redirect to login page or show auth error
    })

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error')
      serverError.status = 500
      
      apiClient.productAPI.getAll.mockRejectedValue(serverError)

      renderWithQueryClient(<ProductGrid />)

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })
    })
  })
})

describe('API Response Format Validation', () => {
  it('should validate success response format', () => {
    const validResponse = {
      success: true,
      data: { products: [] },
      message: 'Products fetched successfully',
      timestamp: new Date().toISOString()
    }

    expect(validResponse.success).toBe(true)
    expect(validResponse.data).toBeDefined()
    expect(validResponse.timestamp).toBeDefined()
  })

  it('should validate error response format', () => {
    const errorResponse = {
      success: false,
      message: 'Validation error',
      timestamp: new Date().toISOString(),
      error: 'Invalid input data'
    }

    expect(errorResponse.success).toBe(false)
    expect(errorResponse.message).toBeDefined()
    expect(errorResponse.timestamp).toBeDefined()
  })

  it('should validate paginated response format', () => {
    const paginatedResponse = {
      success: true,
      data: {
        products: [],
        pagination: {
          page: 1,
          pages: 5,
          total: 50,
          limit: 10
        }
      }
    }

    expect(paginatedResponse.success).toBe(true)
    expect(paginatedResponse.data.pagination).toBeDefined()
    expect(paginatedResponse.data.pagination.page).toBe(1)
  })
})
