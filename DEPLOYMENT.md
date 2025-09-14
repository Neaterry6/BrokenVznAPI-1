# BrokenVZN API - Deployment Guide

This guide will help you deploy the BrokenVZN API to various cloud platforms including Vercel, Render, Railway, and Koyeb.

## 🚀 Pre-deployment Setup

### 1. Environment Variables
Make sure to set these environment variables on your hosting platform:

```bash
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
XAI_API_KEY=your_xai_grok_api_key
GEMINI_API_KEY=your_gemini_api_key (optional)
ASSEMBLYAI_API_KEY=your_assemblyai_key (optional)
```

### 2. Database Setup
- The application uses PostgreSQL with Drizzle ORM
- Run `npm run db:push` to sync the database schema
- Make sure your production database is accessible

## 📦 Deployment Platforms

### 1. Vercel Deployment

**Steps:**
1. Push your code to a GitHub repository
2. Connect your GitHub repo to Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Add environment variables in Vercel dashboard
5. Deploy!

**Vercel Configuration:**
- Uses `@vercel/node` for the Express server
- Static files served from `client/dist`
- API routes prefixed with `/api/`

### 2. Render Deployment

**Steps:**
1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Render will use the `render.yaml` configuration
5. Add environment variables in Render dashboard
6. Also create a PostgreSQL database on Render

**Render Configuration:**
- Automatically installs dependencies and builds the project
- Free tier available with automatic sleep after inactivity
- Built-in PostgreSQL database option

### 3. Railway Deployment

**Steps:**
1. Push code to GitHub
2. Create new project on Railway
3. Connect your GitHub repository
4. Railway will detect the `railway.json` configuration
5. Add environment variables in Railway dashboard
6. Deploy automatically

**Railway Configuration:**
- Uses Nixpacks for building
- Automatic deployments from GitHub
- Built-in PostgreSQL addon available

### 4. Koyeb Deployment

**Steps:**
1. Push code to GitHub or use Docker
2. Create new app on Koyeb
3. Use Docker deployment with the provided Dockerfile
4. Set environment variables
5. Deploy

**Docker Configuration:**
- Multi-stage build for optimization
- Production-ready Node.js setup
- Optimized for small container size

### 5. Docker Deployment (Any Platform)

Use the provided `Dockerfile` and `docker-compose.yml`:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t brokenvzn-api .
docker run -p 5000:5000 -e DATABASE_URL=your_db_url brokenvzn-api
```

## 🔧 Build Process

The application includes these build scripts:

```bash
npm run build    # Builds both client and server
npm run start    # Starts production server
npm run dev      # Development server
npm run db:push  # Sync database schema
```

## 📊 API Endpoints Overview

The application includes 50+ endpoints across categories:

- **Social Media**: TikTok, Instagram, YouTube, Pinterest downloaders
- **AI Services**: Grok AI chat, vision, sentiment analysis, summarization
- **Utilities**: Base64, URL shortener, hash generator, text analysis
- **Weather & News**: Current weather, forecasts, news headlines
- **Content**: Quotes, lyrics, image search, waifu generation
- **System**: Health checks, status monitoring

## 🛡️ Security Features

- API key authentication required for all endpoints
- Rate limiting based on user tiers (Free: 1K, Pro: 100K, Enterprise: Unlimited)
- Request logging and analytics
- Secure session management
- Environment-based configuration

## 📈 Monitoring & Analytics

- Built-in API usage tracking
- Request/response logging
- Error handling and reporting
- Health check endpoints
- Admin dashboard for monitoring

## 🔑 API Keys

Users need to register and get an API key to use the service. The API supports:
- Header authentication: `X-API-Key: your_key`
- Query parameter: `?apiKey=your_key`

## 🎯 Performance Optimization

- Efficient database queries with Drizzle ORM
- Response caching where appropriate
- Optimized build process with Vite and esbuild
- Minimal Docker image size
- CDN-ready static assets

## 📚 Documentation

- Interactive API testing interface on the homepage
- Complete endpoint documentation
- Code examples in multiple languages
- Postman collection available

## 🆘 Troubleshooting

**Common Issues:**

1. **Build Failures**: Ensure all dependencies are properly installed
2. **Database Connection**: Verify DATABASE_URL format and accessibility
3. **API Key Issues**: Check XAI_API_KEY is correctly set for Grok services
4. **Port Conflicts**: Application runs on port 5000 by default
5. **Memory Issues**: Some platforms may need increased memory limits

**Health Check:**
Visit `/api/health` to verify the service is running correctly.

## 📞 Support

For deployment issues or questions:
- Check the logs on your hosting platform
- Verify all environment variables are set
- Test locally first with `npm run dev`
- Use the `/api/status` endpoint for service health

Happy deploying! 🚀