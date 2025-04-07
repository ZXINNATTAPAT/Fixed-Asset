# Step 1: Build Angular app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# ✅ เข้าสู่โฟลเดอร์ Angular ก่อน build
WORKDIR /app  # หรือ WORKDIR /app/<ชื่อโปรเจกต์> ถ้าซ้อนอยู่ใน subfolder

RUN npm run build -- --configuration=production --base-href=/

# Step 2: Serve with NGINX
FROM nginx:alpine

COPY --from=builder /app/dist/ETC-ASSET-SYSTEM /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
