import {
	useCopilotAction,
	useCopilotReadable,
	useFrontendTool,
	useHumanInTheLoop,
} from '@copilotkit/react-core';
import React, { useState } from 'react';

export default function IndigoPassengerDetails() {
	const [formData, setFormData] = useState({
		passengerInfo: Array.from({ length: 9 }, (_, index) => ({
			[`gender-${index}`]: '',
			firstName: '',
			lastName: '',
			dateOfBirth: '',
		})),
		mobileNumber: '',
		email: '',
		consentConditions: true,
		consentOffers: false,
		consentWhatsApp: false,
		numberOfPassengers: 9,
	});
	const [confirmResult, setConfirmResult] = useState<boolean | null>(null);

	const handlePassengerInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index?: number
	) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => {
			if (index !== undefined) {
				// Update specific passenger info
				const updatedPassengerInfo = [...prev.passengerInfo];
				updatedPassengerInfo[index] = {
					...updatedPassengerInfo[index],
					[name]: value,
				};
				return {
					...prev,
					passengerInfo: updatedPassengerInfo,
				};
			} else {
				// Update global fields like consent, email, mobile number
				return {
					...prev,
					[name]: type === 'checkbox' ? checked : value,
				};
			}
		});
	};

	useHumanInTheLoop({
		name: 'submitForm',
		description:
			'Ask user to confirm before submitting the form. Only submit after all the required fields are filled.',
		render: ({ args, status, respond }) => {
			if (status === 'executing' && respond) {
				return (
					<div className="p-4 border rounded">
						<p>Are your sure you want to submit the form?</p>
						<div className="flex gap-2 mt-4">
							<button
								onClick={(e) => {
									setConfirmResult(true);
									respond({ confirmed: true });
									handleSubmit(e);
								}}
								className="bg-green-500 text-white px-4 py-2 rounded"
							>
								Submit
							</button>
							<button
								onClick={() => {
									setConfirmResult(false);
									respond({ confirmed: false });
								}}
								className="bg-gray-300 px-4 py-2 rounded"
							>
								Cancel
							</button>
						</div>
					</div>
				);
			}
			if (status === 'complete' && confirmResult !== null) {
				return (
					<div className="p-2 text-sm text-gray-600">
						{confirmResult
							? 'Form submitted successfully'
							: 'Submit cancelled'}
					</div>
				);
			}
			return <></>;
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Form Data Submitted:', formData);
	};

	const passengerCards = formData.passengerInfo.map((passenger, index) => (
		<div
			key={index}
			className="rounded-xl bg-white p-6 shadow-sm"
		>
			<div className="flex justify-between items-center mb-4">
				<div>
					<div className="font-semibold">Adult {index + 1}</div>
					<div className="text-sm text-gray-500">
						Passenger {index + 1}
					</div>
				</div>
			</div>

			{/* Gender */}
			<div className="flex gap-6 mb-4">
				<label className="flex items-center gap-2">
					<input
						type="radio"
						name={`gender-${index}`}
						value="Male"
						checked={
							formData.passengerInfo[index][
								`gender-${index}`
							].toUpperCase() === 'MALE'
						}
						onChange={(e) => handlePassengerInputChange(e, index)}
					/>{' '}
					Male
				</label>
				<label className="flex items-center gap-2">
					<input
						type="radio"
						name={`gender-${index}`}
						value="Female"
						checked={
							formData.passengerInfo[index][
								`gender-${index}`
							].toUpperCase() === 'FEMALE'
						}
						onChange={(e) => handlePassengerInputChange(e, index)}
					/>{' '}
					Female
				</label>
			</div>

			<p className="text-xs text-gray-500 mb-4">
				<b>Important:</b> For International Travel - Enter your first,
				middle, and last name exactly as they appear on your passport.
				For Domestic Travel - Enter your name exactly as it appears on
				your Government ID.
			</p>

			{/* Name Fields */}
			<div className="grid grid-cols-2 gap-4 mb-4">
				<input
					className="rounded-md border px-4 py-3 text-sm"
					name="firstName"
					value={passenger.firstName}
					onChange={(e) => handlePassengerInputChange(e, index)}
					placeholder="First and Middle Name"
				/>
				<input
					className="rounded-md border px-4 py-3 text-sm"
					name="lastName"
					value={passenger.lastName}
					onChange={(e) => handlePassengerInputChange(e, index)}
					placeholder="Last Name"
				/>
			</div>

			<input
				className="w-full rounded-md border px-4 py-3 text-sm"
				name="dateOfBirth"
				value={passenger.dateOfBirth}
				onChange={(e) => handlePassengerInputChange(e, index)}
				placeholder="Date of Birth (Optional)"
			/>
		</div>
	));

	// Consent form details action
	useCopilotAction({
		name: 'fillPassengerConsentDetailsForm',
		description: 'Fill out the passenger consent details form',
		parameters: [
			{
				name: 'consentConditions',
				type: 'boolean',
				required: true,
				description:
					"User's consent to privacy policy and company terms and conditions.",
			},
			{
				name: 'consentOffers',
				type: 'boolean',
				required: false,
				description: "User's consent to receive offers and deals.",
			},
			{
				name: 'consentWhatsApp',
				type: 'boolean',
				required: false,
				description: "User's consent to receive updates on WhatsApp.",
			},
		],
		handler: async (action) => {
			setFormData((prev) => ({
				...prev,
				consentConditions: action.consentConditions,
				consentOffers: action.consentOffers || false,
				consentWhatsApp: action.consentWhatsApp || false,
			}));
		},
	});

	// Contact form details action
	useCopilotAction({
		name: 'fillPassengerContactDetailsForm',
		description: 'Fill out the passenger contact details form',
		parameters: [
			{
				name: 'mobileNumber',
				type: 'string',
				required: true,
				description: "User's mobile number.",
			},
			{
				name: 'email',
				type: 'string',
				required: true,
				description: "User's email address.",
			},
		],
		handler: async (action) => {
			setFormData((prev) => ({
				...prev,
				mobileNumber: action.mobileNumber,
				email: action.email,
			}));
		},
	});

	useCopilotAction({
		name: 'updatePassengerField',
		description: `
            Use this action whenever the user provides or implies passenger personal details
            in natural language.

            Mandatory execution rules:
            - If a passenger's firstName is updated AND the name is commonly associated
            with a specific gender, you MUST ALSO update the gender field in the same turn.
            - Do NOT skip gender inference for common names (e.g. John, Elizabeth, Rahul, Priya).
            - Gender inference MUST be performed unless the name is ambiguous.

            Interpretation rules:
            - The speaker ("my", "me", "I") ALWAYS refers to passengerIndex 0
            - Companions mentioned after "with", "and", "along with" refer to passengerIndex 1, 2, ...
            - Full names must be split into:
                - first word → firstName
                - last word → lastName

            Gender inference rules (in priority order):
            1. Explicit gender mention → use it
            2. Honorifics:
            - Mr. → Male
            - Mrs., Ms., Miss → Female
            3. Name-based inference for common names:
            - John, Michael, Rahul, Amit → Male
            - Elizabeth, Priya, Sarah, Anjali → Female
            4. If the name is ambiguous (e.g. Alex, Sam), DO NOT infer gender

            Action execution rules:
            - Emit separate action calls for each field update
            - Gender update MUST be emitted after firstName update if applicable
            - Do NOT respond conversationally if any passenger detail is present

            Examples (MANDATORY PATTERN):
            "My name is John Doe"
            → updatePassengerField(0, "firstName", "John")
            → updatePassengerField(0, "lastName", "Doe")
            → updatePassengerField(0, "gender", "Male")

            "I am with Elizabeth Smith"
            → updatePassengerField(1, "firstName", "Elizabeth")
            → updatePassengerField(1, "lastName", "Smith")
            → updatePassengerField(1, "gender", "Female")

        `,
		parameters: [
			{
				name: 'passengerIndex',
				type: 'number',
				description: `Index of the passenger.
                If not explicitly stated, infer using the interpretation rules:
                - Speaker → 0
                - First companion → 1
                - Second companion → 2
                `,
			},
			{
				name: 'field',
				type: 'string',
				description: `
                Field to update.
                Allowed values:
                - firstName
                - lastName
                - gender
                - dateOfBirth
                `,
			},
			{
				name: 'value',
				type: 'string',
				description: "New value extracted from the user's message",
			},
		],
		handler: ({ passengerIndex, field, value }) => {
			setFormData((prev) => {
				const updatedPassengers = [...prev.passengerInfo];

				if (!updatedPassengers[passengerIndex]) return prev;

				if (field === 'gender') {
					updatedPassengers[passengerIndex][
						`gender-${passengerIndex}`
					] = value;
				} else {
					updatedPassengers[passengerIndex][field] = value;
				}

				return {
					...prev,
					passengerInfo: updatedPassengers,
				};
			});
		},
	});

	useCopilotReadable(
		{
			description:
				'The passenger details form data including passenger info, contact details, and consents and their current values.',
			value: formData,
		},
		[formData]
	);

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f4f9ff] to-white font-sans text-[#1b2a4e]">
			{/* Header */}
			<header className="flex items-center gap-4 px-8 py-4">
				<img
					src="https://s6web-uat.goindigo.in/content/dam/s6web/in/en/assets/indigo-logo.png"
					alt="IndiGo"
					className="h-6"
				/>
				<a
					href="#"
					className="text-sm text-blue-600"
				>
					&lt; BACK TO SEARCH RESULTS
				</a>
			</header>

			{/* Route Bar */}
			<div className="mx-8 mb-6 rounded-full bg-[#0a1fa8] py-3 text-center text-white font-semibold">
				DEL <span className="mx-4 opacity-60">----------</span> BOM
			</div>

			<div className="grid grid-cols-[1fr_360px] gap-6 px-8">
				{/* Left Section */}
				<div className="space-y-6">
					<h2 className="text-lg font-semibold">
						Enter passenger details
					</h2>

					{/* Render Passenger Cards */}
					{passengerCards}

					{/* Add-ons */}
					<div className="grid grid-cols-2 gap-6">
						<div className="rounded-xl bg-[#f1f8ff] p-6">
							<h3 className="font-semibold mb-2">
								Travel Assistance
							</h3>
							<ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
								<li>Emergency Medical hospitalization</li>
								<li>Baggage Protection</li>
							</ul>
							<div className="flex justify-between items-center">
								<span className="font-semibold text-green-600">
									₹189
								</span>
								<button className="rounded-full bg-blue-700 px-4 py-2 text-white text-sm">
									Add
								</button>
							</div>
						</div>

						<div className="rounded-xl bg-white p-6 shadow-sm relative">
							<span className="absolute top-3 right-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
								Recommended
							</span>
							<h3 className="font-semibold mb-2">
								Zero Cancellation
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								Cancel up to 24 hours before departure, no
								questions asked.
							</p>
							<div className="flex justify-between items-center">
								<span className="font-semibold text-green-600">
									₹499
								</span>
								<button className="rounded-full bg-blue-700 px-4 py-2 text-white text-sm">
									Add
								</button>
							</div>
						</div>
					</div>

					{/* Contact */}
					<div className="rounded-xl bg-white p-6 shadow-sm">
						<h3 className="font-semibold mb-4">Contact details</h3>
						<div className="grid grid-cols-2 gap-4 mb-6">
							<input
								className="rounded-md border px-4 py-3 text-sm"
								name="mobileNumber"
								value={formData.mobileNumber}
								onChange={handlePassengerInputChange}
								placeholder="+91 Mobile Number"
							/>
							<input
								className="rounded-md border px-4 py-3 text-sm"
								name="email"
								value={formData.email}
								onChange={handlePassengerInputChange}
								placeholder="Email ID"
							/>
						</div>

						{/* Consent Checkboxes */}
						<div className="space-y-4 text-sm text-gray-700">
							<label className="flex items-start gap-3">
								<input
									type="checkbox"
									name="consentConditions"
									checked={formData.consentConditions}
									onChange={handlePassengerInputChange}
									className="mt-1"
								/>
								<span>
									I have read and agree to IndiGo’s
									<a
										href="#"
										className="text-blue-600"
									>
										{' '}
										Conditions of Carriage
									</a>
									. I further agree to the
									<a
										href="#"
										className="text-blue-600"
									>
										{' '}
										Privacy Policy
									</a>{' '}
									and consent to the processing of the
									personal data.
								</span>
							</label>

							<label className="flex items-start gap-3">
								<input
									type="checkbox"
									name="consentOffers"
									checked={formData.consentOffers}
									onChange={handlePassengerInputChange}
									className="mt-1"
								/>
								<span>
									I would like to receive the latest offers
									and deals from IndiGo and its partners. I
									can unsubscribe from all marketing
									communications at any time.
								</span>
							</label>

							<label className="flex items-start gap-3">
								<input
									type="checkbox"
									name="consentWhatsApp"
									checked={formData.consentWhatsApp}
									onChange={handlePassengerInputChange}
									className="mt-1"
								/>
								<span>
									Get updates on{' '}
									<span className="font-medium text-green-600">
										WhatsApp
									</span>
									<div className="text-xs text-gray-500 mt-1">
										By subscribing to this, you agree to the
										terms and conditions of WhatsApp and to
										IndiGo’s Privacy Policy.
									</div>
								</span>
							</label>
						</div>
					</div>
				</div>

				{/* Right Summary */}
				<aside className="space-y-4">
					<div className="rounded-xl bg-white p-4 shadow-sm">
						<div className="flex justify-between mb-2">
							<h3 className="font-semibold">Trip Summary</h3>
							<a
								href="#"
								className="text-sm text-blue-600"
							>
								DETAILS
							</a>
						</div>
						<div className="text-sm text-gray-600">1 Adult</div>
					</div>

					<div className="rounded-xl bg-white p-4 shadow-sm">
						<h4 className="font-semibold mb-2">Flight Summary</h4>
						<div className="text-sm">
							<div className="font-semibold">Delhi → Mumbai</div>
							<div className="text-gray-500">
								02h 35m • Non-stop
							</div>
							<div className="mt-2">
								Check-in: 15KG | Hand: 7KG
							</div>
						</div>
					</div>
				</aside>
			</div>

			{/* Footer */}
			<footer className="mt-6 px-8">
				<div className="rounded-xl bg-white p-4 shadow-sm text-center">
					<div className="text-sm text-gray-500">TOTAL FARE</div>
					<div className="text-2xl font-bold">₹6,083</div>
					<button
						className="mt-3 w-full rounded-full bg-blue-700 py-2 text-white"
						onClick={handleSubmit}
					>
						Next
					</button>
				</div>
			</footer>
		</div>
	);
}
