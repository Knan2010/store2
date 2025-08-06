# Replit.md - Full-Stack Grocery Management Application

## Overview

This is a full-stack grocery management application built with Express.js backend, React frontend, and PostgreSQL database. The application features an admin panel for managing products and categories, with Replit authentication for user management. The frontend uses shadcn/ui components with Tailwind CSS for styling.

## User Preferences

Preferred communication style: Simple, everyday language.
Security preferences: Hide default login credentials from UI for better security.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Bundler**: Vite with custom configuration for development and production
- **UI Framework**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Uploads**: Multer middleware for image handling

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Migrations**: Generated in `./migrations` directory
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Database Schema
- **Sessions Table**: Required for Replit Auth session storage
- **Users Table**: User profiles with Replit Auth integration
- **Categories Table**: Product categories with slug-based routing
- **Products Table**: Product information with image support and category relationships

### Authentication System
- **Provider**: Local username/password authentication for admin
- **Default Admin**: username "admin", password "admin123" (not displayed in UI)
- **Session Storage**: Memory-based sessions with express-session
- **Middleware**: Authentication checks for protected admin routes
- **Security**: Login credentials hidden from public interface

### API Routes
- **Auth Routes**: User authentication and profile management
- **Category Routes**: CRUD operations for product categories
- **Product Routes**: Full product management with image upload
- **File Serving**: Static file serving for uploaded images

### Frontend Pages
- **Landing Page**: Public product catalog view
- **Admin Dashboard**: Protected admin interface for product management
- **Authentication Flow**: Seamless integration with Replit Auth

## Data Flow

1. **Authentication**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Product Management**: Admin users can create/edit/delete products with image uploads
3. **Category Management**: Products are organized by categories with friendly URLs
4. **File Handling**: Images uploaded via multer, stored locally, served statically
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache management

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service
- **File Storage**: Local filesystem for uploaded images
- **UI Components**: Radix UI primitives via shadcn/ui

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Development server with HMR and production builds
- **Drizzle Kit**: Database schema management and migrations
- **ESLint/Prettier**: Code quality and formatting (implied by structure)

## Deployment Strategy

### Development
- **Backend**: Node.js server with tsx for TypeScript execution
- **Frontend**: Vite dev server with proxy to backend
- **Database**: Connected to Neon PostgreSQL via environment variables
- **Hot Reload**: Full-stack development with automatic reloading

### Production
- **Build Process**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: esbuild bundles server to `dist/index.js`
- **Static Assets**: Express serves built frontend and uploaded files
- **Environment**: Production mode with optimized builds
- **Database**: Same Neon PostgreSQL connection for production

### Key Configuration Files
- **Package Scripts**: Separate dev/build/start commands
- **Vite Config**: Custom aliases and build settings
- **Drizzle Config**: Database connection and schema configuration
- **TypeScript**: Shared configuration for all modules

The application follows a modern full-stack architecture with strong type safety, efficient development workflow, and production-ready deployment strategy.