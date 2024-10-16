import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { useGame } from "@/components/GameProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ScoreBoard() {
	const { players } = useGame();

	return (
		<Card className="bg-white shadow-xl rounded-lg overflow-hidden border border-indigo-200">
			<CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
				<CardTitle className="text-3xl font-bold">Scoreboard</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-indigo-800">Name</TableHead>
							<TableHead className="text-indigo-800">Score</TableHead>
							<TableHead className="text-indigo-800">Voted</TableHead>
							<TableHead className="text-indigo-800">Time of Vote</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.entries(players)
							.sort(([, a], [, b]) => {
								if (b.score !== a.score) {
									return b.score - a.score;
								}
								const timeA = a.guess?.timestamp
									? new Date(a.guess.timestamp).getTime()
									: Number.POSITIVE_INFINITY;
								const timeB = b.guess?.timestamp
									? new Date(b.guess.timestamp).getTime()
									: Number.POSITIVE_INFINITY;
								return timeA - timeB;
							})
							.map(([id, player]) => (
								<TableRow
									key={id}
									className="bg-gradient-to-r from-indigo-50 to-purple-50"
								>
									<TableCell className="font-medium text-indigo-800">
										{player.name}
									</TableCell>
									<TableCell className="text-purple-600 font-bold">
										{player.score}
									</TableCell>
									<TableCell>
										<Badge
											className={cn(
												player.hasGuessed ? "bg-green-500" : "bg-red-500",
												"text-white",
											)}
										>
											{player.hasGuessed ? "Yes" : "No"}
										</Badge>
									</TableCell>
									<TableCell className="text-gray-600">
										{player.guess?.timestamp
											? new Date(player.guess.timestamp).toLocaleTimeString()
											: "-"}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</CardContent>
			<CardContent className="p-6">
				<p className="text-lg font-semibold text-indigo-800 mb-4">
					Total Players: {Object.keys(players).length}
				</p>
			</CardContent>
		</Card>
	);
}
