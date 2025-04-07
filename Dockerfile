# Step 1: Build Angular app
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the source code and build the Angular app
COPY . .
# RUN npm run build --prod
RUN npm run build --configuration=production


# Step 2: Serve with NGINX
FROM nginx:alpine

# Copy built Angular app to NGINX
COPY --from=builder /app/dist/ETC-ASSET-SYSTEM /usr/share/nginx/html

# Copy custom NGINX config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
