#!/usr/bin/env node

/**
 * API Test Script for Chess Server
 * 
 * Usage:
 *   node test-api.js
 * 
 * Tests all API endpoints and WebSocket functionality
 */

const http = require("http");
const io = require("socket.io-client");

const API_BASE = "http://localhost:3001";
const SOCKET_URL = "http://localhost:3001";

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[36m",
};

function log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    switch (type) {
        case "success":
            console.log(`${colors.green}✓${colors.reset} [${timestamp}] ${message}`);
            break;
        case "error":
            console.log(`${colors.red}✗${colors.reset} [${timestamp}] ${message}`);
            break;
        case "info":
            console.log(`${colors.blue}ℹ${colors.reset} [${timestamp}] ${message}`);
            break;
        case "warn":
            console.log(`${colors.yellow}⚠${colors.reset} [${timestamp}] ${message}`);
            break;
        default:
            console.log(`[${timestamp}] ${message}`);
    }
}

// REST API Tests
async function testRestAPI() {
    log("info", "Testing REST API endpoints...");
    console.log("");

    try {
        // Test 1: Health check
        log("info", "Testing GET /health");
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        if (healthResponse.ok) {
            log("success", `Server is ${healthData.status}`);
            log("info", `Active rooms: ${healthData.activeRooms}, Matches: ${healthData.activeMatches}`);
        } else {
            log("error", "Health check failed");
        }
        console.log("");

        // Test 2: List rooms
        log("info", "Testing GET /api/rooms");
        const roomsResponse = await fetch(`${API_BASE}/api/rooms`);
        const roomsData = await roomsResponse.json();
        if (roomsResponse.ok) {
            log("success", `Found ${roomsData.rooms.length} active rooms`);
            if (roomsData.rooms.length > 0) {
                console.log("  Sample room:", JSON.stringify(roomsData.rooms[0], null, 2));
            }
        } else {
            log("error", "Failed to list rooms");
        }
        console.log("");

        // Test 3: Create room
        log("info", "Testing POST /api/rooms");
        const createRoomResponse = await fetch(`${API_BASE}/api/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName: "TestPlayer1" }),
        });
        const roomData = await createRoomResponse.json();
        if (createRoomResponse.ok) {
            log("success", "Room created successfully");
            log("info", `Room ID: ${roomData.roomId}`);
            log("info", `Match ID: ${roomData.matchId}`);
            console.log("");

            // Test 4: Get room details
            log("info", `Testing GET /api/rooms/${roomData.roomId}`);
            const getRoomResponse = await fetch(`${API_BASE}/api/rooms/${roomData.roomId}`);
            const getRoomData = await getRoomResponse.json();
            if (getRoomResponse.ok) {
                log("success", "Room details retrieved");
                console.log("  Details:", JSON.stringify(getRoomData, null, 2));
            } else {
                log("error", "Failed to get room details");
            }
            console.log("");

            // Test 5: List matches
            log("info", "Testing GET /api/matches");
            const matchesResponse = await fetch(`${API_BASE}/api/matches`);
            const matchesData = await matchesResponse.json();
            if (matchesResponse.ok) {
                log("success", `Found ${matchesData.matches.length} active matches`);
                if (matchesData.matches.length > 0) {
                    console.log("  Sample match:", JSON.stringify(matchesData.matches[0], null, 2));
                }
            } else {
                log("error", "Failed to list matches");
            }
            console.log("");

            // Test 6: Get match details
            if (matchesData.matches.length > 0) {
                const matchId = matchesData.matches[0].matchId;
                log("info", `Testing GET /api/matches/${matchId}`);
                const getMatchResponse = await fetch(`${API_BASE}/api/matches/${matchId}`);
                const getMatchData = await getMatchResponse.json();
                if (getMatchResponse.ok) {
                    log("success", "Match details retrieved");
                    console.log("  Details:", JSON.stringify(getMatchData, null, 2));
                } else {
                    log("error", "Failed to get match details");
                }
            }
        } else {
            log("error", "Failed to create room");
            console.log("  Response:", roomData);
        }
    } catch (error) {
        log("error", `REST API test failed: ${error.message}`);
    }

    console.log("");
    console.log("================================");
    console.log("");
}

// WebSocket Tests
async function testWebSocket() {
    log("info", "Testing WebSocket functionality...");
    console.log("");

    return new Promise((resolve) => {
        try {
            const socket1 = io(SOCKET_URL, { reconnection: true });
            let roomId = null;

            socket1.on("connect", () => {
                log("success", "Socket 1 connected");

                // Emit joinRoom as Player 1 (create room)
                log("info", "Player 1: Creating new room");
                socket1.emit("joinRoom", {
                    roomId: "test-room-" + Date.now(),
                    playerName: "SocketTestPlayer1",
                    userId: "user-test-1",
                });
            });

            socket1.on("playerColor", (color) => {
                log("success", `Player 1 assigned color: ${color}`);
                if (color === "white") {
                    roomId = "test-room-" + Date.now();
                    log("success", "Player 1 is ready");
                    console.log("");

                    // Now connect player 2
                    log("info", "Connecting Player 2...");
                    const socket2 = io(SOCKET_URL, { reconnection: true });

                    socket2.on("connect", () => {
                        log("success", "Socket 2 connected");

                        // Emit joinRoom as Player 2 (join room)
                        log("info", `Player 2: Joining room ${roomId}`);
                        socket2.emit("joinRoom", {
                            roomId: roomId,
                            playerName: "SocketTestPlayer2",
                            userId: "user-test-2",
                        });
                    });

                    socket2.on("playerColor", (color) => {
                        log("success", `Player 2 assigned color: ${color}`);
                    });

                    socket2.on("gameStart", (players) => {
                        log("success", "Game started with players:", players.length);
                        players.forEach((p) => {
                            log("info", `  - ${p.name} (${p.color})`);
                        });
                        console.log("");

                        // Test move
                        log("info", "Player 1: Sending test move");
                        socket1.emit("move", {
                            roomId: roomId,
                            move: { from: "e2", to: "e4" },
                            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
                        });
                    });

                    socket2.on("opponentMove", ({ move, fen }) => {
                        log("success", `Player 2 received opponent's move: ${move.from} to ${move.to}`);
                        console.log("");

                        // Test end game
                        log("info", "Player 1: Ending test game");
                        socket1.emit("endGame", {
                            roomId: roomId,
                            winner: "draw",
                            reason: "test",
                        });
                    });

                    socket2.on("matchEnded", ({ winner, reason }) => {
                        log("success", `Match ended with result: ${winner} (${reason})`);
                        console.log("");

                        // Cleanup
                        log("info", "Cleaning up test sockets...");
                        socket1.close();
                        socket2.close();

                        setTimeout(() => {
                            log("success", "WebSocket tests completed");
                            console.log("");
                            resolve();
                        }, 500);
                    });

                    socket2.on("disconnect", () => {
                        log("info", "Socket 2 disconnected");
                    });
                }
            });

            socket1.on("error", (error) => {
                log("error", `Socket error: ${error}`);
            });

            socket1.on("disconnect", () => {
                log("info", "Socket 1 disconnected");
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                log("warn", "WebSocket test timeout");
                socket1.close();
                resolve();
            }, 10000);
        } catch (error) {
            log("error", `WebSocket test failed: ${error.message}`);
            resolve();
        }
    });
}

// Main test runner
async function runAllTests() {
    console.log("");
    console.log("╔════════════════════════════════════════════╗");
    console.log("║    Chess Server API Test Suite             ║");
    console.log("║    Testing http://localhost:3001           ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("");

    // Check if server is running
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error("Server not responding");
    } catch (error) {
        log("error", `Cannot connect to server at ${API_BASE}`);
        log("info", "Make sure the server is running: npm run dev");
        process.exit(1);
    }

    // Run tests
    await testRestAPI();
    await testWebSocket();

    console.log("╔════════════════════════════════════════════╗");
    console.log("║    All tests completed!                    ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("");
}

// Run tests
runAllTests().catch((error) => {
    log("error", `Test suite failed: ${error.message}`);
    process.exit(1);
});
