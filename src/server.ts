import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import type {
	ServerToClientEvents,
	ClientToServerEvents,
	Guess,
	Players,
} from "./types";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
	},
});

const PORT = 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

// Game state
const suspects = [
	"Colonel Mustard",
	"Miss Scarlet",
	"Professor Plum",
	"Mrs. Peacock",
	"Mr. Green",
	"Mrs. White",
];
const weapons = [
	"Candlestick",
	"Dagger",
	"Lead Pipe",
	"Revolver",
	"Rope",
	"Wrench",
];
const rooms = [
	"Kitchen",
	"Ballroom",
	"Conservatory",
	"Dining Room",
	"Billiard Room",
	"Library",
	"Lounge",
	"Hall",
	"Study",
];

let solution: Guess;
const players: Players = {};
let gameInProgress = false;

function generateSolution() {
	solution = {
		suspect: suspects[Math.floor(Math.random() * suspects.length)],
		weapon: weapons[Math.floor(Math.random() * weapons.length)],
		room: rooms[Math.floor(Math.random() * rooms.length)],
	};
	console.log("Solution:", solution);
	gameInProgress = true;
}

io.on("connection", (socket) => {
	console.log("A user connected");

	socket.on("join", (name: string) => {
		players[socket.id] = { score: 0, name };
		io.emit("updatePlayers", players);
	});

	socket.on("guess", ({ suspect, weapon, room }: Guess) => {
		if (!gameInProgress) return;

		let score = 0;
		if (suspect === solution.suspect) score++;
		if (weapon === solution.weapon) score++;
		if (room === solution.room) score++;

		players[socket.id].score += score;

		socket.emit("guessResult", {
			score,
			correct: {
				suspect: suspect === solution.suspect,
				weapon: weapon === solution.weapon,
				room: room === solution.room,
			},
		});
		io.emit("updatePlayers", players);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
		delete players[socket.id];
		io.emit("updatePlayers", players);
	});

	// New event to start a new game
	socket.on("startNewGame", () => {
		if (socket.id === Object.keys(players)[0]) {
			generateSolution();
			for (const id in players) {
				players[id].score = 0;
			}
			io.emit("updatePlayers", players);
			io.emit("newGameStarted");
		}
	});

	socket.on("endGame", () => {
		if (socket.id === Object.keys(players)[0]) {
			gameInProgress = false;
			io.emit("gameOver", { solution, scoreboard: players });
		}
	});
});

generateSolution();

httpServer.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
