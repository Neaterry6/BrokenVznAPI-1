# Overview

BrokenVZN API is a comprehensive REST API service that provides social media content downloading, utility tools, and various developer services. The application is built as a full-stack solution with a React frontend for documentation and interaction, and an Express backend that handles API requests with rate limiting and user management.

The API offers multiple services including TikTok video downloading, Instagram post extraction, YouTube video information retrieval, QR code generation, URL shortening, text-to-speech conversion, and password generation. It features a tiered subscription model (free, pro, enterprise) with different rate limits and API key-based authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and JavaScript using Vite as the build tool. It follows a component-based architecture with:
- **UI Framework**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and API interactions
- **Build System**: Vite with hot module replacement and development server integration

The frontend serves as both documentation and interactive playground for the API, with pages for home, documentation, and a 404 handler.

## Backend Architecture
The server uses Express.js with JavaScript and follows a service-oriented architecture:
- **Framework**: Express.js with middleware for JSON parsing and logging
- **Services**: Modular service classes for different API functionalities (TikTok, Instagram, YouTube, QR codes, URL shortener, TTS, password generation)
- **Storage**: Abstract storage interface with in-memory implementation for user management, API logging, and URL shortening
- **Authentication**: API key-based authentication with rate limiting per user tier
- **Development Integration**: Vite middleware integration for development mode

## Data Storage Solutions
The application uses a dual-storage approach:
- **Production Database**: Firebase Firestore through the REST API
- **Development Storage**: In-memory storage implementation as fallback when Firebase credentials are unavailable
- **Database Provider**: Firebase (configurable via FIREBASE_PROJECT_ID plus service account or FIREBASE_API_KEY environment variables)

The schema includes:
- Users table with API keys, request counts, and subscription tiers
- API logs for request tracking and analytics
- URL shortener table for shortened links with click tracking

## Authentication and Authorization
- **API Key Authentication**: Each user has a unique API key for request authentication
- **Rate Limiting**: Tiered rate limits (free: 1000, pro: 100,000, enterprise: unlimited requests)
- **Request Tracking**: All API calls are logged with user association, response times, and status codes
- **Middleware Validation**: Centralized API key validation and rate limit enforcement

## API Service Architecture
Each service follows a consistent pattern:
- **Service Classes**: Independent service classes for different functionalities
- **Error Handling**: Consistent error response format with success/error indicators
- **Response Standardization**: Uniform response structure across all endpoints
- **Async Processing**: Promise-based architecture for handling external API calls and processing

# External Dependencies

## Database and ORM
- **Neon Database**: Serverless PostgreSQL provider for production data storage
- **Drizzle ORM**: Historical ORM notes retained for reference; active storage now uses Firebase Firestore
- **Drizzle Kit**: Schema migrations and database management tools

## Frontend Dependencies
- **React Ecosystem**: React 18 with JavaScript, Wouter for routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with PostCSS for processing
- **State Management**: TanStack Query for server state management
- **HTTP Client**: Axios for API requests
- **Build Tools**: Vite with React plugin and development tools

## Backend Dependencies
- **Express.js**: Web framework with middleware support
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Development Tools**: tsx for local JavaScript execution, esbuild for production builds
- **Validation**: Zod for schema validation integrated with Drizzle

## Development and Deployment
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Error Handling**: Runtime error overlay for development
- **Build Process**: Separate client and server build processes with ESM module support
- **Environment Configuration**: Environment-based configuration for database connections and API settings