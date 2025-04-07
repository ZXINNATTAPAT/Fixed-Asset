# Build Angular App
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production --base-href=/

# Serve using http-server
FROM node:18 AS runtime
WORKDIR /app

# ติดตั้ง http-server
RUN npm install -g http-server

# คัดลอกไฟล์ที่ build แล้วมา
COPY --from=build /app/dist/ETC-ASSET-SYSTEM /app

EXPOSE 8080

# เสิร์ฟแบบ SPA (สำคัญมาก!)
CMD ["http-server", "-p", "8080", "-c-1", "--spa"]
