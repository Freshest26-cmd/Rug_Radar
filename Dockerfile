# Stage 1: Build C++ Backend
FROM node:20-slim AS cpp-build

# Install build tools and libraries for Debian
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libpqxx-dev \
    libssl-dev \
    zlib1g-dev \
    nlohmann-json3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Build uWebSockets and uSockets manually as they are often missing in standard repos
WORKDIR /deps
RUN git clone --recursive https://github.com/uNetworking/uWebSockets.git
WORKDIR /deps/uWebSockets/uSockets
RUN make
WORKDIR /deps/uWebSockets
RUN make

COPY ./backend-cpp /app/backend-cpp
WORKDIR /app/backend-cpp

# Ensure includes can find uWebSockets
RUN cp -r /deps/uWebSockets/src /usr/local/include/uWebSockets && \
    cp -r /deps/uWebSockets/uSockets/src /usr/local/include/uSockets && \
    cp /deps/uWebSockets/uSockets/uSockets.a /usr/local/lib/ && \
    cp /deps/uWebSockets/uSockets/*.o /usr/local/lib/ || true

RUN mkdir build && cd build && cmake .. && make

# Stage 2: Build Node.js App
FROM node:20-slim AS node-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Final Production Image
FROM node:20-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    libboost-system1.74.0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node-build /app /app
COPY --from=cpp-build /app/backend-cpp/build/rugradar_backend /app/rugradar_backend

# Create a start script to run both
RUN echo '#!/bin/bash\n\
./rugradar_backend & \n\
npm start' > /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]
