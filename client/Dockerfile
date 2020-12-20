# build stage
FROM node:alpine as builder
WORKDIR '/app'
COPY package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

# serve stage
FROM nginx
EXPOSE 3000
COPY  ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/build /usr/share/nginx/html