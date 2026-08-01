'use client';

import { CopilotSidebar } from '@copilotkit/react-ui';
import IndigoPassengerDetails from '@/util/pdp';

export default function CopilotKitPage() {
	return (
		<main>
			<CopilotSidebar
				disableSystemMessage={false}
				clickOutsideToClose={false}
				labels={{
					title: '6ESkai Assistant',
					initial: "👋 Hi, there! I'm 6ESkai.",
				}}
				icons={{
					openIcon: <SkaiComponent />,
				}}
				suggestions={[
					{
						title: 'Fill out the form',
						message: `i'm manan bhatia, i'm travelling with my colleagues, their names are as follows -> 
                            john doe, jane doe, rishabh jain, rythm sachdeva, ankit yadav, sanjeev kumar, sunil kumar, charu verma,
                            my contact email is test@test.com, phone number is 9999999999. i agree to all the terms and conditions.`,
					},
					{
						title: 'Review details',
						message: "Let's review the details before submission.",
					},
					{
						title: 'Submit the form',
						message: 'Looks good to me, please submit the form.',
					},
				]}
			>
				<IndigoPassengerDetails />
			</CopilotSidebar>
		</main>
	);
}

function SkaiComponent() {
	return (
		<img
			alt="Custom Avatar"
			src="/6E Skai Logo.png"
			className="rounded-full h-auto w-auto max-h-20 max-w-20 object-contain"
		/>
	);
}
