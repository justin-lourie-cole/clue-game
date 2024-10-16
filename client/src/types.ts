import type { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io-client";

// Game-related interfaces

export interface Suspect {
	name: string;
	description: string;
}

// list of suspects
export const suspects: Suspect[] = [
	{
		name: "Gerard",
		description: "Legal Counsel",
	},
	{
		name: "Gordon",
		description: "Creative Genius",
	},
	{
		name: "Justin",
		description: "Account Executive",
	},
	{
		name: "Mike",
		description: "Tech Wizard",
	},
	{
		name: "Shalini",
		description: "Data Analyst",
	},
	{
		name: "Su",
		description: "Social Media Manager",
	},
];

export interface Weapon {
	name: string;
}

// list of weapons
export const weapons: Weapon[] = [
	{
		name: "Stapler",
	},
	{
		name: "Keyboard",
	},
	{
		name: "Coffee Mug",
	},
	{
		name: "USB Cable",
	},
	{
		name: "Knife",
	},
];

// list of rooms
export const rooms: Room[] = [
	{
		name: "Meeting room",
	},
	{
		name: "Men's bathroom",
	},
	{
		name: "Office",
	},
	{
		name: "Kitchen",
	},
	{
		name: "Carpark",
	},
	{
		name: "Reception",
	},
];

export interface Room {
	name: string;
}

export interface Solution {
	suspect: Suspect;
	weapon: Weapon;
	room: Room;
}

export const solution: Solution = {
	suspect: suspects[4],
	weapon: weapons[3],
	room: rooms[4],
};

export interface Guess {
	suspect: Suspect["name"];
	weapon: Weapon["name"];
	room: Room["name"];
	timestamp: Date;
}

export interface GuessResult {
	score: number;
	correct: {
		suspect: boolean;
		weapon: boolean;
		room: boolean;
	};
	timestamp: Date;
}

// Player-related interfaces
export type Players = { [id: string]: Player };

export interface Player {
	score: number;
	guess: Guess | null;
	name: string;
	hasGuessed: boolean;
}

// Socket event interfaces
export interface ServerToClientEvents {
	updatePlayers: (players: Players) => void;
	guessResult: (result: GuessResult) => void;
	gameOver: (gameOver: { solution: Solution; scoreboard: Players }) => void;
	newGameStarted: () => void;
	updateSolution: (solution: Solution) => void;
	setGameMaster: (isGameMaster: boolean) => void;
	error: (error: string) => void;
	updateCurrentPlayer: (currentPlayer: string | null) => void;
}

export interface ClientToServerEvents {
	join: (name: string, isGameMaster: boolean) => void;
	guess: (guess: Guess) => void;
	startNewGame: () => void;
	endGame: () => void;
	resetScores: () => void;
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
