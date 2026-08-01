import Link from 'next/link';
import React from 'react';

export default function IndigoItinerary() {
	return (
		<div className="min-h-screen bg-linear-to-b from-[#eef7fc] to-white p-8 font-sans">
			<div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
				{/* Left Section */}
				<div className="col-span-8">
					{/* Header */}
					<div className="mb-6">
						<img
							src="https://s6web-uat.goindigo.in/content/dam/s6web/in/en/assets/indigo-logo.png"
							alt="IndiGo"
							className="h-10 mb-6"
						/>
						<h1 className="text-3xl font-semibold">
							Your{' '}
							<span className="text-green-500">Itinerary</span>
						</h1>
						<p className="mt-2 text-gray-700 font-medium">
							Hello Raja Test
						</p>
						<p className="text-gray-500">
							Your itinerary is generated
						</p>
					</div>

					{/* Itinerary Card */}
					<div className="bg-[#dff1fb] rounded-xl p-6 shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<span className="font-semibold text-gray-700">
								DEL
							</span>
							<span className="text-gray-400 tracking-widest">
								··········
							</span>
							<span className="font-semibold text-gray-700">
								BOM
							</span>
						</div>

						<div className="flex justify-between items-center bg-white rounded-lg px-4 py-3">
							<div className="flex items-center gap-6 text-gray-700">
								<div className="flex items-center gap-2">
									<span>📅</span>
									<span>27 Dec, 25</span>
								</div>
								<div className="flex items-center gap-2">
									<span>🧍</span>
									<span>1 Pax</span>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<span className="text-sm text-gray-600">
									PNR: <strong>RV9S3D</strong>
								</span>
								<span className="flex items-center gap-1 text-green-600 font-medium">
									✔ Confirmed
								</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4 mt-6">
						<button className="flex-1 border rounded-full py-3 font-medium">
							Save / Share
						</button>
						<button className="flex-1 bg-[#0b1ea8] text-white rounded-full py-3 font-medium">
							Modify
						</button>
					</div>

					{/* Tiles */}
					<div className="grid grid-cols-4 gap-4 mt-8">
						{[
							'Upgrade to Stretch',
							'Split PNR',
							'Special assistance',
							'Edit add-ons',
							'Change flight',
							'Change seat',
							'Update contact',
							'Edit IndiGo BluChip ID',
							'Web Check-in',
							'Cancel flight',
						].map((item, idx) => (
							<Link
								key={idx}
								href="/upgd"
								className="bg-white rounded-xl p-4 text-center text-sm shadow hover:shadow-md transition
                 focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								<div className="mb-2 text-xl">✈️</div>
								<div className="text-gray-700 font-medium">
									{item}
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Right Section */}
				<div className="col-span-4 space-y-6">
					<a
						href="#"
						className="block text-right text-blue-600 font-medium"
					>
						RETRIEVE ANOTHER BOOKING
					</a>

					<div className="bg-white rounded-2xl shadow overflow-hidden">
						<img
							src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
							alt="Hotel"
							className="h-56 w-full object-cover"
						/>
						<div className="p-4">
							<h3 className="text-lg font-semibold">
								Up to 30%* off on Hotels unlocked
							</h3>
							<div className="mt-3 bg-black/60 text-white p-3 rounded-lg text-sm">
								Use code <strong>HOTELDEAL</strong> at checkout.
								<p className="mt-1">
									Mumbai flight starting from ₹1,900
								</p>
							</div>
						</div>
					</div>

					<div className="bg-linear-to-r from-blue-600 to-sky-400 rounded-2xl p-6 text-white shadow">
						<h3 className="text-2xl font-semibold">
							50% off on Sight Seeing
						</h3>
						<p className="mt-2 text-sm">
							3 lakh+ tours and activities | Free cancellation up
							to 24 hours | Earn IndiGo BluChips
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
