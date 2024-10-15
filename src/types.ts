import type { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io-client";

// Game-related interfaces
export interface Solution {
	suspect: string;
	weapon: string;
	room: string;
}

export interface Guess extends Solution {}

export interface GuessResult {
	score: number;
	correct: {
		suspect: boolean;
		weapon: boolean;
		room: boolean;
	};
}

// Player-related interfaces
export type Players = { [id: string]: Player };

export interface Player {
	score: number;
	name: string;
}

// Socket event interfaces
export interface ServerToClientEvents {
	updatePlayers: (players: Players) => void;
	guessResult: (result: GuessResult) => void;
	gameOver: (gameOver: { solution: Solution; scoreboard: Players }) => void;
	newGameStarted: () => void;
}

export interface ClientToServerEvents {
	join: (name: string) => void;
	guess: (guess: Guess) => void;
	startNewGame: () => void;
	endGame: () => void;
}

// Socket types
export type ServerSocket = SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents
>;

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type IOServer = SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents
>;
