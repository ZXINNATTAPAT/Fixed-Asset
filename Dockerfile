# Step 1: Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production --base-href=/

# Step 2: Serve using http-server
FROM node:18 AS runtime
WORKDIR /app
RUN npm install -g http-server
# คัดลอกเนื้อหาของโฟลเดอร์ browser ไปยัง working directory /app
COPY --from=build /app/dist/ETC-ASSET-SYSTEM/browser/ /app/
EXPOSE 8080
CMD ["http-server", "-p", "8080", "-c-1", "--spa"]
