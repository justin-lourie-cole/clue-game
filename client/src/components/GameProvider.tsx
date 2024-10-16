import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import type {
	Players,
	Solution,
	ServerToClientEvents,
	ClientToServerEvents,
	GuessResult,
} from "@/types";

interface GameContextType {
	socket: Socket<ServerToClientEvents, ClientToServerEvents>;
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
	joined: boolean;
	setJoined: React.Dispatch<React.SetStateAction<boolean>>;
	players: Players;
	gameOver: { solution: Solution; scoreboard: Players } | null;
	isGameMaster: boolean;
	setIsGameMaster: React.Dispatch<React.SetStateAction<boolean>>;
	solution: Solution | null;
	handleGuess: (suspect: string, weapon: string, room: string) => void;
	guessResult: GuessResult | null;
	handleJoin: (
		name: string,
		isGameMaster: boolean,
		password: string | undefined,
	) => void;
	handleStartNewGame: () => void;
	handleEndGame: () => void;
	error: string | null;
	currentPlayer: string | null;
	newGameStarted: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [socket] = useState(() =>
		io(backendUrl, {
			transports: ["websocket", "polling"],
		}),
	);
	const [name, setName] = useState("");
	const [joined, setJoined] = useState(false);
	const [players, setPlayers] = useState<Players>({});
	const [gameOver, setGameOver] = useState<{
		solution: Solution;
		scoreboard: Players;
	} | null>(null);
	const [isGameMaster, setIsGameMaster] = useState(false);
	const [solution, setSolution] = useState<Solution | null>(null);
	const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
	const [newGameStarted, setNewGameStarted] = useState(false);
	useEffect(() => {
		socket.on("updatePlayers", (updatedPlayers) => {
			setPlayers(updatedPlayers);
		});

		socket.on("gameOver", (gameOverData) => {
			setGameOver(gameOverData);
		});

		socket.on("newGameStarted", () => {
			setGameOver(null);
			setNewGameStarted(true);
		});

		socket.on("updateSolution", (newSolution) => {
			setSolution(newSolution);
		});

		socket.on("setGameMaster", (isGameMaster) => {
			setIsGameMaster(isGameMaster);
		});

		socket.on("guessResult", (result) => {
			setGuessResult(result);
		});

		socket.on("currentPlayer", (player) => {
			setCurrentPlayer(player);
		});

		socket.on("error", (error) => {
			setError(error);
		});

		return () => {
			socket.off("updatePlayers");
			socket.off("gameOver");
			socket.off("newGameStarted");
			socket.off("updateSolution");
			socket.off("setGameMaster");
			socket.off("guessResult");
			socket.off("error");
			socket.off("currentPlayer");
		};
	}, [socket]);

	const handleJoin = (
		name: string,
		isGameMaster: boolean,
		password: string | undefined,
	) => {
		if (name) {
			socket.emit("join", name, isGameMaster, password);
			setJoined(true);
		}
	};

	const handleGuess = (suspect: string, weapon: string, room: string) => {
		if (suspect && weapon && room) {
			socket.emit("guess", { suspect, weapon, room, timestamp: new Date() });
		}
	};

	const handleStartNewGame = () => {
		socket.emit("startNewGame");
	};

	const handleEndGame = () => {
		socket.emit("endGame");
	};

	const value = {
		socket,
		name,
		setName,
		joined,
		setJoined,
		players,
		gameOver,
		isGameMaster,
		setIsGameMaster,
		solution,
		handleJoin,
		handleStartNewGame,
		handleEndGame,
		handleGuess,
		guessResult,
		error,
		currentPlayer,
		newGameStarted,
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
	const context = useContext(GameContext);
	if (context === undefined) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
};
