# Dockerfile for auth-client
FROM nginx:alpine

# Copy client files
COPY . /usr/share/nginx/html/

# Create nginx config that fixes routing issues for SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
     location /api/auth/ { \
        proxy_pass http://secureauth:3000/api/auth/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80
