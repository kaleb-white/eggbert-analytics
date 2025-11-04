# Use a basic lightweight GNU Linux (Debian slim)
FROM debian:12-slim

# Set noninteractive frontend for apt
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Install required system packages: curl, ca-certificates, git, build tools for npm native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    build-essential \
    python3 \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS) and npm via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm --version && node --version

# Copy package manifests first for efficient docker layer caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install bun
RUN npm i bun -g

# Install dependencies
RUN bun i

# Expose required ports (next server, cache, proxy, proxy test server)
# Next dev
EXPOSE 3000/tcp
# Cache
EXPOSE 1037/tcp
# Proxy
EXPOSE 1038/tcp
# Proxy test
EXPOSE 1313/tcp

# Copy the rest of the application
COPY . .


#TODO:
    # Custom network for interoperation with postgres: https://docs.docker.com/get-started/docker-concepts/running-containers/overriding-container-defaults/
        # Section: Run postgres container in a controlled network
