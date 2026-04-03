cmake_minimum_required(VERSION 3.10)
project(SolanaScanner)

set(CMAKE_CXX_STANDARD 17)

find_package(Boost REQUIRED COMPONENTS system)
find_package(CURL REQUIRED)

add_executable(scanner main.cpp)
target_link_libraries(scanner Boost::system CURL::libcurl)
