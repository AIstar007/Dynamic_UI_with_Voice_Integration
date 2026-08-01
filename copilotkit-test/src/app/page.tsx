'use client';

import IndigoItinerary from '@/util/itinerary';
import { CopilotSidebar } from '@copilotkit/react-ui';

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
				suggestions={[
					{
						title: 'Generative UI',
						message: 'Get the weather in San Francisco.',
					},
					{
						title: 'Frontend Tools',
						message: 'Set the theme to green.',
					},
					{
						title: 'Human In the Loop',
						message: 'Please go to the moon.',
					},
					{
						title: 'Write Agent State',
						message: 'Add a proverb about AI.',
					},
					{
						title: 'Update Agent State',
						message:
							'Please remove 1 random proverb from the list if there are any.',
					},
					{
						title: 'Read Agent State',
						message: 'What are the proverbs?',
					},
				]}
				icons={{
					openIcon: <SkaiComponent />,
				}}
			>
				<IndigoItinerary />
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
