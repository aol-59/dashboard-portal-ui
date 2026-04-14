FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_URL=http://localhost:8000
ARG VITE_AUTH_URL=http://localhost:8180
ARG VITE_AUTH_REALM=dashboard
ARG VITE_AUTH_CLIENT_ID=dashboard-app
ARG VITE_USE_MOCKS=false

RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
