# Build stage
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libpqxx-dev \
    nlohmann-json3-dev \
    libssl-dev \
    zlib1g-dev

# Install uWebSockets
RUN git clone --recursive https://github.com/uNetworking/uWebSockets.git /uWebSockets
WORKDIR /uWebSockets
RUN make && make install

WORKDIR /app
COPY . .

RUN mkdir build && cd build && cmake .. && make

# Run stage
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libpqxx-6.4 \
    libssl3 \
    zlib1g \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/build/rugradar_backend .
COPY backup.sh .
RUN chmod +x backup.sh

EXPOSE 3001

CMD ["./rugradar_backend"]
