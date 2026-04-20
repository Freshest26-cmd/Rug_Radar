cmake_minimum_required(VERSION 3.10)
project(RugRadarBackend)

set(CMAKE_CXX_STANDARD 17)

# Find dependencies
find_package(pqxx REQUIRED)
find_package(nlohmann_json REQUIRED)

# Include directories
include_directories(/usr/local/include)

# Add executable
add_executable(rugradar_backend main.cpp)

# Link libraries
target_link_libraries(rugradar_backend pqxx nlohmann_json::nlohmann_json uSockets uWebSockets pthread)
