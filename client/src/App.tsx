import { GameProvider } from "./components/GameProvider";
import GameComponent from "./components/GameComponent";

export default function App() {
	return (
		<GameProvider>
			<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
				<GameComponent />
			</div>
		</GameProvider>
	);
}
