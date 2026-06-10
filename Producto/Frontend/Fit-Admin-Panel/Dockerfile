FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_DASHBOARD_URL=http://localhost:3001
ARG VITE_SUPERVISOR_URL=http://localhost:3003
ARG VITE_ECOMMERCE_URL=http://localhost:3002
ARG VITE_SUCURSAL_URL=http://localhost:3004
ENV VITE_DASHBOARD_URL=$VITE_DASHBOARD_URL
ENV VITE_SUPERVISOR_URL=$VITE_SUPERVISOR_URL
ENV VITE_ECOMMERCE_URL=$VITE_ECOMMERCE_URL
ENV VITE_SUCURSAL_URL=$VITE_SUCURSAL_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
