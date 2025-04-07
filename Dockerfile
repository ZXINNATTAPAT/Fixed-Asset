# Step 1: Build Angular app
FROM node:18 AS builder

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build Angular and output to dist/ETC-ASSET-SYSTEM
RUN npm run build --configuration=production --base-href=/

# Step 2: Serve with NGINX
FROM nginx:alpine

COPY --from=builder /dist/ETC-ASSET-SYSTEM /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
