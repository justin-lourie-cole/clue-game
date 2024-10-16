import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import {
	type ServerToClientEvents,
	type ClientToServerEvents,
	type Guess,
	type Players,
	solution,
} from "./types";

const backendUrl =
	process.env.NODE_ENV === "production"
		? "https://clue-game-1.onrender.com"
		: "http://localhost:5173";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
	cors: {
		origin: backendUrl,
		methods: ["GET", "POST"],
	},
});

const PORT = 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

const players: Players = {};
let gameInProgress = false;
let gameMaster: string | null = null;
let currentPlayer: string | null = null;

function generateSolution() {
	console.log("Solution:", solution);
	gameInProgress = true;
	io.emit("updateSolution", solution);
	// Set the first player as the current player when a new game starts
	currentPlayer = Object.keys(players)[0];
	io.emit("updateCurrentPlayer", currentPlayer);
}

io.on("connection", (socket) => {
	console.log("A user connected");

	socket.on("join", (name: string, isGameMaster: boolean) => {
		if (isGameMaster && !gameMaster) {
			gameMaster = socket.id;
			socket.emit("setGameMaster", true);
			socket.emit("updateSolution", solution);
		} else if (!isGameMaster) {
			players[socket.id] = { score: 0, name, guess: null, hasGuessed: false };
			socket.emit("setGameMaster", false);
		} else {
			// Emit an error instead of disconnecting
			socket.emit("error", "A game master already exists");
			return;
		}
		// If this is the first player to join, set them as the current player
		if (Object.keys(players).length === 1) {
			currentPlayer = socket.id;
			io.emit("updateCurrentPlayer", currentPlayer);
		}
		io.emit("updatePlayers", players);
	});

	socket.on("guess", ({ suspect, weapon, room, timestamp }: Guess) => {
		if (!gameInProgress) {
			socket.emit("error", "No game is currently in progress");
			return;
		}

		if (players[socket.id].hasGuessed) {
			socket.emit("error", "You have already made a guess this round");
			return;
		}

		let score = 0;
		if (suspect === solution.suspect.name) score++;
		if (weapon === solution.weapon.name) score++;
		if (room === solution.room.name) score++;

		players[socket.id].score += score;
		players[socket.id].guess = { suspect, weapon, room, timestamp };
		players[socket.id].hasGuessed = true;
		socket.emit("guessResult", {
			score,
			correct: {
				suspect: suspect === solution.suspect.name,
				weapon: weapon === solution.weapon.name,
				room: room === solution.room.name,
			},
			timestamp,
		});
		// After processing the guess, move to the next player
		const playerIds = Object.keys(players);
		const currentIndex = playerIds.indexOf(currentPlayer as string);
		const nextIndex = (currentIndex + 1) % playerIds.length;
		currentPlayer = playerIds[nextIndex];
		io.emit("updateCurrentPlayer", currentPlayer);

		io.emit("updatePlayers", players);
	});

	socket.on("resetScores", () => {
		if (socket.id !== gameMaster) {
			socket.emit("error", "Only the game master can reset scores");
			return;
		}
		for (const id in players) {
			players[id].score = 0;
		}
		io.emit("updatePlayers", players);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
		delete players[socket.id];
		if (socket.id === gameMaster) {
			gameMaster = null;
		}
		// If the disconnected player was the current player, move to the next player
		if (socket.id === currentPlayer) {
			const playerIds = Object.keys(players);
			if (playerIds.length > 0) {
				currentPlayer = playerIds[0];
				io.emit("updateCurrentPlayer", currentPlayer);
			} else {
				currentPlayer = null;
			}
		}
		io.emit("updatePlayers", players);
	});

	// Updated event to start a new game
	socket.on("startNewGame", () => {
		if (socket.id !== gameMaster) {
			socket.emit("error", "Only the game master can start a new game");
			return;
		}
		generateSolution();
		for (const id in players) {
			players[id].score = 0;
			players[id].guess = null;
			players[id].hasGuessed = false;
		}
		io.emit("updatePlayers", players);
		io.emit("newGameStarted");
		// Reset the current player to the first player in the list
		const playerIds = Object.keys(players);
		if (playerIds.length > 0) {
			currentPlayer = playerIds[0];
			io.emit("updateCurrentPlayer", currentPlayer);
		}
	});

	socket.on("endGame", () => {
		if (socket.id !== gameMaster) {
			socket.emit("error", "Only the game master can end the game");
			return;
		}
		gameInProgress = false;
		io.emit("gameOver", { solution, scoreboard: players });
		io.emit("updatePlayers", players);
		// Reset the current player
		currentPlayer = null;
		io.emit("updateCurrentPlayer", currentPlayer);
	});
});

generateSolution();

httpServer.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
