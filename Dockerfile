# ==========================================
# EcoPoints React Frontend - Dockerfile Gacor
# Created for: Acong
# ==========================================

# Stage 1: Build Frontend App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and build
COPY . .

# Build Vite React SPA
RUN npm run build

# Stage 2: Serve with Nginx Alpine (Lightweight & Super Fast)
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 9082

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
