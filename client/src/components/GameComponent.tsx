import { useGame } from "./GameProvider";
import GameMasterDashboard from "./GameMasterDashboard";
import PlayerDashboard from "./PlayerDashboard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "./ui/card";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "./ui/checkbox";
import { useEffect } from "react";

const GAME_MASTER_PASSWORD = "master123";

const formSchema = z.object({
	name: z.string().min(1, "Please enter your name"),
	isGameMaster: z.boolean(),
	password: z.string().optional(),
});

export default function GameComponent() {
	const { joined, isGameMaster, handleJoin, newGameStarted } = useGame();

	useEffect(() => {
		if (newGameStarted) {
			window.location.reload();
		}
	}, [newGameStarted]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			isGameMaster: false,
			password: "",
		},
	});

	function handleSubmit(values: z.infer<typeof formSchema>) {
		if (values.isGameMaster && values.password !== GAME_MASTER_PASSWORD) {
			form.setError("password", {
				message: "Incorrect Game Master password",
			});
			return;
		}
		handleJoin(values.name, values.isGameMaster, values.password);
	}

	if (!joined) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center">
				<Card className="bg-white shadow-xl rounded-lg overflow-hidden border border-indigo-200 max-w-md w-full">
					<CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
						<CardTitle className="text-3xl font-bold">Join Game</CardTitle>
					</CardHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<CardContent className="p-6 space-y-6">
								<FormField
									control={form.control}
									name="isGameMaster"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													id="gameMaster"
													checked={field.value}
													onCheckedChange={field.onChange}
													className="border-indigo-300"
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-lg font-semibold text-indigo-800">
													Join as Game Master
												</FormLabel>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-semibold text-indigo-800">
												Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Enter your name"
													className="bg-indigo-50 border-indigo-200"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{form.watch("isGameMaster") && (
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-lg font-semibold text-indigo-800">
													Game Master Password
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="password"
														placeholder="Enter password"
														className="bg-indigo-50 border-indigo-200"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</CardContent>
							<CardFooter className="bg-indigo-50 p-6">
								<Button
									type="submit"
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
								>
									Join Game
								</Button>
							</CardFooter>
						</form>
					</Form>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 ">
			{isGameMaster ? <GameMasterDashboard /> : <PlayerDashboard />}
		</div>
	);
}
