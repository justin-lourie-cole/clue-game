import { useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import type {
	Players,
	GuessResult,
	Solution,
	ServerToClientEvents,
	ClientToServerEvents,
} from "../../src/types";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
	io(backendUrl);

export default function App() {
	const [name, setName] = useState("");
	const [joined, setJoined] = useState(false);
	const [suspect, setSuspect] = useState("");
	const [weapon, setWeapon] = useState("");
	const [room, setRoom] = useState("");
	const [players, setPlayers] = useState<Players>({});
	const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
	const [gameOver, setGameOver] = useState<{
		solution: Solution;
		scoreboard: Players;
	} | null>(null);

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

	useEffect(() => {
		socket.on("updatePlayers", (updatedPlayers) => {
			setPlayers(updatedPlayers);
		});

		socket.on("guessResult", (result) => {
			setGuessResult(result);
		});

		socket.on("gameOver", (gameOver) => {
			setGameOver(gameOver);
		});

		socket.on("newGameStarted", () => {
			setGameOver(null);
		});

		return () => {
			socket.off("updatePlayers");
			socket.off("guessResult");
		};
	}, []);

	const handleJoin = () => {
		if (name) {
			socket.emit("join", name);
			setJoined(true);
		}
	};

	const handleGuess = () => {
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

	const renderGameResult = () => {
		if (!gameOver) return null;

		return (
			<div className="mt-8 bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold mb-4">Game Over</h2>
				<p>The solution was:</p>
				<ul className="list-disc list-inside mb-4">
					<li>Suspect: {gameOver.solution.suspect}</li>
					<li>Weapon: {gameOver.solution.weapon}</li>
					<li>Room: {gameOver.solution.room}</li>
				</ul>
				<h3 className="text-lg font-semibold mb-2">Final Scores:</h3>
				<ul>
					{Object.entries(gameOver.scoreboard).map(([id, player]) => (
						<li key={id} className="mb-1">
							{player.name}: {player.score} points
						</li>
					))}
				</ul>
				<button
					type="button"
					onClick={handleStartNewGame}
					className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
				>
					Start New Game
				</button>
			</div>
		);
	};

	if (!joined) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-md">
					<h1 className="text-2xl font-bold mb-4">Join the Clue Game</h1>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter your name"
						className="w-full p-2 mb-4 border rounded"
					/>
					<button
						type="button"
						onClick={handleJoin}
						className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
					>
						Join Game
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<h1 className="text-3xl font-bold mb-8">Clue Game</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">Make a Guess</h2>
					<select
						value={suspect}
						onChange={(e) => setSuspect(e.target.value)}
						className="w-full p-2 mb-4 border rounded"
					>
						<option value="">Select Suspect</option>
						{suspects.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<select
						value={weapon}
						onChange={(e) => setWeapon(e.target.value)}
						className="w-full p-2 mb-4 border rounded"
					>
						<option value="">Select Weapon</option>
						{weapons.map((w) => (
							<option key={w} value={w}>
								{w}
							</option>
						))}
					</select>
					<select
						value={room}
						onChange={(e) => setRoom(e.target.value)}
						className="w-full p-2 mb-4 border rounded"
					>
						<option value="">Select Room</option>
						{rooms.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={handleGuess}
						className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
					>
						Submit Guess
					</button>
				</div>
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">Players</h2>
					<ul>
						{Object.entries(players).map(([id, player]) => (
							<li key={id} className="mb-2">
								{player.name}: {player.score} points
							</li>
						))}
					</ul>
				</div>
			</div>
			{guessResult && (
				<div className="mt-8 bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">Guess Result</h2>
					<p>You scored {guessResult.score} points!</p>
					<p>
						Suspect: {guessResult.correct.suspect ? "Correct" : "Incorrect"}
					</p>
					<p>Weapon: {guessResult.correct.weapon ? "Correct" : "Incorrect"}</p>
					<p>Room: {guessResult.correct.room ? "Correct" : "Incorrect"}</p>
				</div>
			)}
			{renderGameResult()}
			<button
				type="button"
				onClick={handleEndGame}
				className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
			>
				End Game
			</button>
		</div>
	);
}
