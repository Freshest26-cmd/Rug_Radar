#include <uwebsockets/App.h>
#include <iostream>
#include <string>
#include <vector>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>
#include <thread>
#include <chrono>

using json = nlohmann::json;

struct Token {
    std::string id;
    std::string name;
    std::string symbol;
    std::string address;
    std::string age;
    double liquidity;
    double rugRisk;
    double sentiment;
    int recommendation;
    double volume;
    int holders;
};

// Database connection string from environment
std::string get_db_url() {
    const char* url = std::getenv("DATABASE_URL");
    return url ? url : "postgresql://postgres:postgres@localhost:5432/rugradar";
}

// Atomic transaction to save a token
void save_token_atomic(const Token& token) {
    try {
        pqxx::connection c(get_db_url());
        pqxx::work txn(c); // Start transaction (Atomicity)

        c.prepare("insert_token", 
            "INSERT INTO tokens (id, name, symbol, address, age, liquidity, rug_risk, sentiment, recommendation, volume, holders) "
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) "
            "ON CONFLICT (address) DO UPDATE SET "
            "liquidity = EXCLUDED.liquidity, volume = EXCLUDED.volume, sentiment = EXCLUDED.sentiment");

        txn.exec_prepared("insert_token", 
            token.id, token.name, token.symbol, token.address, token.age, 
            token.liquidity, token.rugRisk, token.sentiment, token.recommendation, 
            token.volume, token.holders);

        txn.commit(); // Commit transaction
        std::cout << "Token saved atomically: " << token.symbol << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Database error: " << e.what() << std::endl;
    }
}

int main() {
    int port = 3001; // C++ backend on 3001, Node/Vite on 3000
    const char* port_env = std::getenv("PORT");
    if (port_env) port = std::stoi(port_env);

    uWS::App().ws<std::string>("/*", {
        /* Settings */
        .compression = uWS::SHARED_COMPRESSOR,
        .maxPayloadLength = 16 * 1024 * 1024,
        .idleTimeout = 16,
        .maxBackpressure = 1 * 1024 * 1024,
        .closeOnBackpressureLimit = false,
        .resetIdleTimeoutOnSend = false,
        .sendPingsAutomatically = true,
        /* Handlers */
        .upgrade = nullptr,
        .open = [](auto *ws) {
            std::cout << "Client connected to C++ WebSocket" << std::endl;
            ws->subscribe("live_feed");
        },
        .message = [](auto *ws, std::string_view message, uWS::OpCode opCode) {
            std::cout << "Received message: " << message << std::endl;
        },
        .drain = [](auto *ws) {
            /* Check ws->getBufferedAmount() here */
        },
        .ping = nullptr,
        .pong = nullptr,
        .close = [](auto *ws, int code, std::string_view message) {
            std::cout << "Client disconnected" << std::endl;
        }
    }).listen(port, [port](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "C++ WebSocket Server listening on port " << port << std::endl;
        }
    }).run();

    return 0;
}
