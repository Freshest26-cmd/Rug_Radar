# Stage 1: Build C++ Backend
FROM alpine:3.18 AS cpp-build
RUN apk add --no-cache build-base cmake boost-dev postgresql-dev uwebsockets-dev nlohmann-json
COPY ./backend-cpp /app/backend-cpp
WORKDIR /app/backend-cpp
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

# Install runtime dependencies for C++ and Node
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
