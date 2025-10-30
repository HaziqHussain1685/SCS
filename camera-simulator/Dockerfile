# SmartCam Shield - Camera Simulator Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy application
COPY app.py .

# Set default environment variables
ENV MODEL="GenericCam X1" \
    FIRMWARE="1.0.0" \
    DEFAULT_USER="admin" \
    DEFAULT_PASS="admin" \
    OPEN_PORTS="80" \
    EXPOSED="false"

# Expose common camera ports (will be overridden by docker-compose)
EXPOSE 21 23 80 554 8080

# Run the simulator
CMD ["python", "-u", "app.py"]
