# ============================================================
# SECURITY-HARDENED DOCKERFILE
# ============================================================
# Use specific version tag (not 'latest') for reproducibility
FROM nginx:1.25-alpine

# ============================================================
# SECURITY: Remove unnecessary packages and reduce attack surface
# ============================================================
RUN apk update && \
    apk upgrade && \
    # Remove unnecessary packages
    apk del --purge curl wget && \
    # Clear package cache
    rm -rf /var/cache/apk/* && \
    # Remove default nginx content
    rm -rf /usr/share/nginx/html/* && \
    # Remove default nginx configs
    rm -f /etc/nginx/conf.d/default.conf

# ============================================================
# SECURITY: Create non-root user for nginx
# ============================================================
RUN addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true

# ============================================================
# SECURITY: Set proper file permissions
# ============================================================
# Create necessary directories with correct ownership
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    chmod -R 755 /var/cache/nginx /var/log/nginx && \
    # nginx.pid needs to be writable
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# ============================================================
# Copy configuration and content
# ============================================================
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx index.html /usr/share/nginx/html/
COPY --chown=nginx:nginx css/ /usr/share/nginx/html/css/
COPY --chown=nginx:nginx js/ /usr/share/nginx/html/js/
COPY --chown=nginx:nginx assets/ /usr/share/nginx/html/assets/
COPY --chown=nginx:nginx pages/ /usr/share/nginx/html/pages/

# ============================================================
# SECURITY: Create simple error pages (don't leak info)
# ============================================================
RUN echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 - Page Not Found</h1></body></html>' > /usr/share/nginx/html/404.html && \
    chown nginx:nginx /usr/share/nginx/html/404.html

# ============================================================
# SECURITY: Set restrictive file permissions on content
# ============================================================
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chmod 644 /etc/nginx/nginx.conf

# ============================================================
# SECURITY: Container hardening labels
# ============================================================
LABEL maintainer="SongDoPartners" \
      version="1.0" \
      description="Hardened static website container" \
      security.privileged="false" \
      security.readonly-rootfs="true"

# Expose port 80 (Lightsail handles HTTPS termination)
EXPOSE 80

# ============================================================
# SECURITY: Health check (using built-in nginx stub)
# ============================================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/bin/sh", "-c", "kill -0 $(cat /var/run/nginx.pid) || exit 1"]

# ============================================================
# SECURITY: Run as non-root (nginx master still needs root for port 80)
# Note: For true non-root, use port 8080 and change nginx.conf
# ============================================================
# Using nginx's built-in user directive instead

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
