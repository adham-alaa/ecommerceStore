# STORE - Modern eCommerce Platform

A full-stack eCommerce clothing store built with the MERN stack, featuring a modern stone-themed UI, product variants (sizes and colors), cash-on-delivery payment, and comprehensive admin management.


## ✨ Features

### Customer Features
- 🛍️ **Product Browsing**: Browse products by categories with dynamic filtering
- 🎨 **Product Variants**: Select from color-specific sizes (XS-XXXL) with unique images per color
- 📊 **Real-time Stock**: See live stock availability for each color-size combination
- 🛒 **Shopping Cart**: Add items with specific variants, modify quantities
- 👤 **Guest Checkout**: Shop without creating an account
- 🔐 **User Authentication**: JWT-based secure authentication with refresh tokens
- 💰 **Cash on Delivery**: Simple payment method for Egyptian market (EGP currency)
- 🎁 **Coupon System**: Apply discount codes at checkout
- 📦 **Order Tracking**: View order history and status
- 🎭 **Smooth Animations**: Framer Motion animations throughout the site


### Admin Features
- 📊 **Analytics Dashboard**: View sales statistics and charts
- 📦 **Order Management**: View all orders, update payment status, filter by status
- 🏷️ **Product Management**: Create, update, delete products with multiple images per color
- 📦 **Inventory Control**: Set individual stock quantities for each color-size combination
- 🔄 **Automatic Stock Updates**: Stock decrements automatically when orders are placed
- 🎯 **Category Management**: Dynamic category creation and management
- 🎫 **Coupon Management**: Create and manage global discount coupons with usage limits
- ⭐ **Featured Products**: Toggle featured status for homepage display with auto-cache refresh

## 🚀 Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool
- **Tailwind CSS v4** - Styling with stone/neutral theme
- **Zustand 5.0.8** - State management
- **React Router v7.9.6** - Client-side routing
- **Framer Motion 12.23.24** - Animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Recharts** - Analytics charts

### Backend
- **Node.js & Express 5.1.0** - Server framework
- **MongoDB & Mongoose 8.19.4** - Database
- **JWT** - Authentication (15min access, 7-day refresh tokens)
- **Redis (Upstash)** - Caching for featured products
- **Cloudinary** - Image storage and management
- **bcryptjs** - Password hashing
- **Cookie-parser** - Cookie handling



## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/recommendations` - Get product recommendations
- `POST /api/products` - Create product (Admin)
- `PATCH /api/products/:id` - Toggle featured status (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart` - Remove from cart
- `PUT /api/cart/:id` - Update cart quantity

### Coupons
- `GET /api/coupons` - Get active coupon
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons` - Create coupon (Admin)
- `DELETE /api/coupons/:id` - Delete coupon (Admin)
- `GET /api/coupons/all` - Get all coupons (Admin)

### Orders/Payments
- `POST /api/payments/create-order` - Create cash order
- `GET /api/payments/orders` - Get user order history
- `GET /api/payments/orders/all` - Get all orders (Admin)
- `PATCH /api/payments/orders/:orderId/status` - Update order status (Admin)

### Analytics (Admin)
- `GET /api/analytics` - Get sales analytics

## 🎨 Design Features

### Theme
- **Color Palette**: Stone/Neutral tones (stone-200 to stone-800)
- **Background**: Radial gradient with subtle stone colors
- **Typography**: Modern, clean fonts with gradient text effects

### Animations
- Smooth page transitions with Framer Motion
- Staggered product card reveals
- Hover effects on cards and buttons
- Scale and lift animations
- Fade-in animations on scroll

### Responsive Design
- Mobile-first approach
- Responsive navigation with dropdown menus
- Adaptive product grids
- Touch-friendly interactions

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Protected routes with middleware
- Admin-only endpoints
- CORS configuration
- Token refresh mechanism


## 📦 Product Variant System

### Color Variants Structure
Each product has **color variants**, where each color has its own sizes and stock:

```javascript
colorVariants: [
  {
    color: "Red",
    image: "cloudinary_url",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 8 }
    ]
  },
  {
    color: "Blue",
    image: "cloudinary_url",
    sizes: [
      { size: "M", stock: 12 },
      { size: "L", stock: 20 }
    ]
  }
]
```

### Features
- **Granular Stock Control**: Each color-size combination has its own stock count
- **Flexible Sizing**: Different colors can have different available sizes
- **Dynamic Images**: Each color variant has its own Cloudinary image URL
- **Smart Selection**: Modal shows only available sizes for selected color
- **Out-of-Stock Handling**: Unavailable sizes are disabled in the UI
- **Automatic Inventory**: Stock decrements automatically when orders are placed
- **Cart Logic**: Items with different size/color combinations are treated as separate entries
- **Cache Management**: Featured products cache updates automatically after stock changes

## 🎁 Coupon System

- **Global Coupons**: Single-use or limited-use codes
- **Discount Percentage**: Apply percentage-based discounts
- **Usage Tracking**: Track current uses vs max uses
- **Auto-deactivation**: Coupons auto-deactivate when max uses reached or expired
- **Expiration Dates**: Set expiration for time-limited offers

## 📊 Order Management

- **Unique Order Numbers**
- **Payment Status**: Pending, Paid, Cancelled
- **Order Details**: Full customer info, products with variants, pricing
- **Admin Dashboard**: Filter orders by status, update payment status
- **Automatic Stock Decrement**: When an order is placed, the specific color-size stock is reduced
- **Cache Refresh**: Featured products cache automatically updates after stock changes

## 📦 Inventory Management

### Stock Tracking
- **Per-Variant Stock**: Each color-size combination tracked independently
- **Real-time Updates**: Stock changes immediately visible across all pages
- **Admin Dashboard**: View total stock and breakdown by color for each product
- **Customer View**: Shows "In Stock" or "Out of Stock" based on total availability
- **Size Availability**: Out-of-stock sizes are disabled in product modal

### Automatic Stock Management
1. When order is placed, system finds the specific product
2. Locates the ordered color variant
3. Finds the specific size within that color
4. Decrements stock: `stock = Math.max(0, stock - quantity)`
5. Updates featured products cache if product is featured
6. Changes reflect immediately on all pages (category, featured, recommendations)

## 🚀 Deployment

### Backend
1. Set environment variables on your hosting platform
2. Ensure MongoDB and Redis are accessible
3. Run `npm start`

### Frontend
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your static hosting service
3. Update API baseURL in `frontend/src/lib/axios.js`


