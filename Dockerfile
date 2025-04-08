# # Step 1: Build Angular app
# FROM node:18 AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps
# COPY . .
# RUN npm run build -- --configuration=production --base-href=/

# # Step 2: Serve using http-server
# FROM node:18 AS runtime
# WORKDIR /app
# RUN npm install -g http-server
# # คัดลอกเนื้อหาของโฟลเดอร์ browser ไปยัง working directory /app
# COPY --from=build /app/dist/ETC-ASSET-SYSTEM/browser/ /app/
# EXPOSE 8080
# CMD ["http-server", "-p", "8080", "-c-1", "--spa"]

# Step 1: Build Angular app
# FROM node:18 AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps
# COPY . .
#RUN npm run build -- --configuration=production --base-href=/

# Step 2: Serve using http-server
# FROM node:18 AS runtime
# WORKDIR /app
# RUN npm install -g http-server
# COPY --from=build /app/dist/ETC-ASSET-SYSTEM/browser/ /app/
# ENV PORT=8080
# EXPOSE 8080
# ใช้ --spa เพื่อให้รองรับ Angular routes (refresh แล้วไม่ 404)
# CMD ["sh", "-c", "http-server -p ${PORT} -c-1 --spa"]


FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production --base-href=/

FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ETC-ASSET-SYSTEM/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

