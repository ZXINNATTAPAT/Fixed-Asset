# Step 1: Build Angular app
FROM node:latest AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npm install -g @angular/cli --legacy-peer-deps

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production --base-href=/

# Step 2: Serve with NGINX
FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ETC-ASSET-SYSTEM /usr/share/nginx/html


EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
