import type React from "react";
import { suspects, weapons, rooms } from "@/types";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGame } from "@/components/GameProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScoreBoard } from "@/components/ScoreBoard";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	suspect: z.string().min(1, "Please select a suspect"),
	weapon: z.string().min(1, "Please select a weapon"),
	room: z.string().min(1, "Please select a room"),
});

const PlayerDashboard: React.FC = () => {
	const { handleGuess, gameOver, guessResult, players } = useGame();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			suspect: "",
			weapon: "",
			room: "",
		},
	});

	if (gameOver) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-8">
				<ScoreBoard />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
				{!guessResult && (
					<Card className="bg-white shadow-xl rounded-lg overflow-hidden border border-indigo-200">
						<CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
							<CardTitle className="text-3xl font-bold">Make a Guess</CardTitle>
						</CardHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit((values) =>
									handleGuess(values.suspect, values.weapon, values.room),
								)}
							>
								<CardContent className="p-6 space-y-6">
									<FormField
										control={form.control}
										name="suspect"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-lg font-semibold text-indigo-800">
													Suspect
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="bg-indigo-50 border-indigo-200">
															<SelectValue placeholder="Select Suspect" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{suspects.map((suspect) => (
															<SelectItem
																key={suspect.name}
																value={suspect.name}
															>
																{suspect.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="weapon"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-lg font-semibold text-indigo-800">
													Weapon
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="bg-indigo-50 border-indigo-200">
															<SelectValue placeholder="Select Weapon" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{weapons.map((weapon) => (
															<SelectItem key={weapon.name} value={weapon.name}>
																{weapon.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="room"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-lg font-semibold text-indigo-800">
													Room
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="bg-indigo-50 border-indigo-200">
															<SelectValue placeholder="Select Room" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{rooms.map((room) => (
															<SelectItem key={room.name} value={room.name}>
																{room.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
								<CardFooter className="bg-indigo-50 p-6">
									<Button
										type="submit"
										className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
									>
										Submit Guess
									</Button>
								</CardFooter>
							</form>
						</Form>
					</Card>
				)}
				{guessResult && (
					<Card className="bg-white shadow-xl rounded-lg overflow-hidden border border-indigo-200">
						<CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
							<CardTitle className="text-3xl font-bold">Guess Result</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Voted</TableHead>
										<TableHead>Time of Vote</TableHead>
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
														? new Date(
																player.guess.timestamp,
															).toLocaleTimeString()
														: "-"}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default PlayerDashboard;
