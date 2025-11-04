// import Box from "@mui/material/Box";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import CardHeader from "@mui/material/CardHeader";
// import { Iconify } from "@beep/ui/atoms";
// import Typography from "@mui/material/Typography";
// import Skeleton from "@mui/material/Skeleton";
// import { useParams, useRouter } from "next/navigation";
// import { useRuntime } from "@beep/runtime-client";
export const AcceptInvitationView = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      {/*{invitation ? (*/}
      {/*	<Card className="w-full max-w-md">*/}
      {/*		<CardHeader>*/}
      {/*			<CardTitle>Organization Invitation</CardTitle>*/}
      {/*			<CardDescription>*/}
      {/*				You've been invited to join an organization*/}
      {/*			</CardDescription>*/}
      {/*		</CardHeader>*/}
      {/*		<CardContent>*/}
      {/*			/!*{invitationStatus === "pending" && (*!/*/}
      {/*			/!*	<div className="space-y-4">*!/*/}
      {/*			/!*		<p>*!/*/}
      {/*			/!*			<strong>{invitation?.inviterEmail}</strong> has invited you to*!/*/}
      {/*			/!*			join <strong>{invitation?.organizationName}</strong>.*!/*/}
      {/*			/!*		</p>*!/*/}
      {/*			/!*		<p>*!/*/}
      {/*			/!*			This invitation was sent to{" "}*!/*/}
      {/*			/!*			<strong>{invitation?.email}</strong>.*!/*/}
      {/*			/!*		</p>*!/*/}
      {/*			/!*	</div>*!/*/}
      {/*			/!*)}*!/*/}
      {/*			/!*{invitationStatus === "accepted" && (*!/*/}
      {/*			/!*	<div className="space-y-4">*!/*/}
      {/*			/!*		<div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">*!/*/}
      {/*			/!*			<CheckIcon className="w-8 h-8 text-green-600" />*!/*/}
      {/*			/!*		</div>*!/*/}
      {/*			/!*		<h2 className="text-2xl font-bold text-center">*!/*/}
      {/*			/!*			Welcome to {invitation?.organizationName}!*!/*/}
      {/*			/!*		</h2>*!/*/}
      {/*			/!*		<p className="text-center">*!/*/}
      {/*			/!*			You've successfully joined the organization. We're excited to*!/*/}
      {/*			/!*			have you on board!*!/*/}
      {/*			/!*		</p>*!/*/}
      {/*			/!*	</div>*!/*/}
      {/*			/!*)}*!/*/}
      {/*			/!*{invitationStatus === "rejected" && (*!/*/}
      {/*			/!*	<div className="space-y-4">*!/*/}
      {/*			/!*		<div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">*!/*/}
      {/*			/!*			<XIcon className="w-8 h-8 text-red-600" />*!/*/}
      {/*			/!*		</div>*!/*/}
      {/*			/!*		<h2 className="text-2xl font-bold text-center">*!/*/}
      {/*			/!*			Invitation Declined*!/*/}
      {/*			/!*		</h2>*!/*/}
      {/*			/!*		<p className="text-center">*!/*/}
      {/*			/!*			You&lsquo;ve declined the invitation to join{" "}*!/*/}
      {/*			/!*			{invitation?.organizationName}.*!/*/}
      {/*			/!*		</p>*!/*/}
      {/*			/!*	</div>*!/*/}
      {/*			/!*)}*!/*/}
      {/*		</CardContent>*/}
      {/*		/!*{invitationStatus === "pending" && (*!/*/}
      {/*		/!*	<CardFooter className="flex justify-between">*!/*/}
      {/*		/!*		<Button variant="outline" onClick={() => {}}>*!/*/}
      {/*		/!*			Decline*!/*/}
      {/*		/!*		</Button>*!/*/}
      {/*		/!*		<Button onClick={() => {}}>Accept Invitation</Button>*!/*/}
      {/*		/!*	</CardFooter>*!/*/}
      {/*		/!*)}*!/*/}
      {/*	</Card>*/}
      {/*) : error ? (*/}
      {/*	<InvitationError />*/}
      {/*) : (*/}
      {/*	<InvitationSkeleton />*/}
    </div>
  );
};

// function InvitationSkeleton() {
// 	return (
// 		<Card className="w-full max-w-md mx-auto">
// 			<CardHeader>
// 				<div className="flex items-center space-x-2">
// 					<Skeleton className="w-6 h-6 rounded-full" />
// 					<Skeleton className="h-6 w-24" />
// 				</div>
// 				<Skeleton className="h-4 w-full mt-2" />
// 				<Skeleton className="h-4 w-2/3 mt-2" />
// 			</CardHeader>
// 			<CardContent>
// 				<div className="space-y-2">
// 					<Skeleton className="h-4 w-full" />
// 					<Skeleton className="h-4 w-full" />
// 					<Skeleton className="h-4 w-2/3" />
// 				</div>
// 			</CardContent>
// 			{/*<CardFooter className="flex justify-end">*/}
// 			{/*	<Skeleton className="h-10 w-24" />*/}
// 			{/*</CardFooter>*/}
// 		</Card>
//   )
// }
