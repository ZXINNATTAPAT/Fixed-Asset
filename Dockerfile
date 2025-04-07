# Step 1: Build Angular app
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production --base-href=/

# Step 2: Serve with http-server
FROM node:18 AS run

# ติดตั้ง http-server แบบ global
RUN npm install -g http-server

WORKDIR /app

# คัดลอกไฟล์ที่ build แล้วจากขั้นตอนก่อนหน้า
COPY --from=build /app/dist/ETC-ASSET-SYSTEM .

# ให้รัน server ที่ port 8080
EXPOSE 8080

CMD ["http-server", "-p", "8080"]
