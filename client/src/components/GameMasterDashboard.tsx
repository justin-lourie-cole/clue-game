import type React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/components/GameProvider";
import { ScoreBoard } from "@/components/ScoreBoard";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
	Table,
	TableCell,
	TableBody,
	TableRow,
	TableHeader,
	TableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const GameMasterDashboard: React.FC = () => {
	const { handleStartNewGame, handleEndGame, solution, players, error } =
		useGame();

	const { toast } = useToast();

	useEffect(() => {
		if (error) {
			toast({
				title: "Error",
				description: error,
				variant: "destructive",
			});
		}
	}, [error, toast]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card className="bg-white shadow-xl rounded-lg overflow-hidden border border-indigo-200">
					<CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
						<CardTitle className="text-3xl font-bold">
							Game Master Dashboard
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-6">
								<h3 className="text-2xl font-semibold text-indigo-800">
									Game Controls
								</h3>
								<Button
									onClick={handleStartNewGame}
									className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
								>
									Start New Game
								</Button>
								<Button
									onClick={handleEndGame}
									className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
								>
									End Game
								</Button>
							</div>
							<div className="space-y-4">
								<h3 className="text-2xl font-semibold text-indigo-800">
									Current Solution
								</h3>
								{solution ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Category</TableHead>
												<TableHead>Value</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{Object.entries(solution).map(([category, value]) => (
												<TableRow key={category}>
													<TableCell className="text-indigo-600 capitalize font-medium">
														{category}
													</TableCell>
													<TableCell>
														<Badge className="font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-3 py-1 rounded-full">
															{value.name}
														</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								) : (
									<p className="text-gray-600 italic bg-yellow-100 p-3 rounded-lg">
										No active game
									</p>
								)}
							</div>
						</div>
						<div className="mt-10">
							<h3 className="text-2xl font-semibold text-indigo-800 mb-4">
								Player Scores
							</h3>
							<ul className="space-y-3">
								{Object.entries(players).map(([id, player]) => (
									<li
										key={id}
										className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg shadow-sm"
									>
										<span className="font-medium text-indigo-800">
											{player.name}
										</span>
										<span className="text-purple-600 font-bold bg-white px-3 py-1 rounded-full shadow-inner">
											{player.score} points
										</span>
									</li>
								))}
							</ul>
						</div>
					</CardContent>
				</Card>
				<ScoreBoard />
			</div>
		</div>
	);
};

export default GameMasterDashboard;
