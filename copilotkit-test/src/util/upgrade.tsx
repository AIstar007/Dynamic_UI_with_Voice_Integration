'use client';

export default function PDPPage() {
  return (
    <main className="min-h-screen w-full bg-[#eef7ff] px-10 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-blue-700 text-sm font-medium cursor-pointer">
          ← BACK TO SEARCH RESULTS
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Next : Add On</span>
          <div className="flex gap-2">
            <span className="w-16 h-1 bg-blue-900 rounded-full" />
            <span className="w-16 h-1 bg-gray-200 rounded-full" />
            <span className="w-16 h-1 bg-gray-200 rounded-full" />
            <span className="w-16 h-1 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Route Pill */}
      <div className="mb-8">
        <div className="max-w-3xl bg-[#0b0fa8] text-white rounded-full px-10 py-3 text-sm font-medium">
          <div className="flex items-center justify-center gap-8">
            <span>DEL</span>
            <span className="opacity-60">────────</span>
            <span>NMI</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* LEFT SECTION */}
        <div className="col-span-8">
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            Enter passenger details
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Login to book with your saved details
          </p>

          {/* Passenger Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#f3fbff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-1 h-10 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Adult 1</p>
                  <p className="text-xs text-gray-500">Passenger 1</p>
                </div>
              </div>
              <span className="text-gray-500">⌃</span>
            </div>

            {/* Card Body */}
            <div className="px-6 py-6 space-y-5">
              {/* Gender */}
              <div className="flex gap-10 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input type="radio" className="accent-blue-700" />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" className="accent-blue-700" />
                  Female
                </label>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Important:</strong> *For International Travel – Enter your
                first, middle, and last name exactly as they appear on your
                Passport. *For Domestic Travel – Enter your name exactly as it
                appears on your Government ID.
              </p>

              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First And Middle Name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* DOB */}
              <input
                type="text"
                placeholder="Date Of Birth (Optional)"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none"
              />
              <p className="text-xs text-gray-400">
                * Please enter date of birth in (DD-MM-YYYY) format i.e. 25-04-1998
              </p>

              {/* Expand Rows */}
              <div className="bg-[#e5f5ff] rounded-lg px-4 py-3 flex items-center justify-between text-sm text-gray-700 cursor-pointer">
                Special Assistance
                <span className="text-blue-700 text-lg">+</span>
              </div>

              <div className="bg-[#e5f5ff] rounded-lg px-4 py-3 flex items-center justify-between text-sm text-gray-700 cursor-pointer">
                Add IndiGo BluChip Membership Number
                <span className="text-blue-700 text-lg">+</span>
              </div>
            </div>
          </div>

          {/* Question */}
          <p className="mt-6 text-sm text-gray-700">
            Are there any passengers EU citizens aged 12–15 years, or
            Indian/Non-EU citizens aged 12–17 years?
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="col-span-4 space-y-6">
          {/* Trip Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Trip Summary
              </h3>
              <span className="text-sm text-blue-700 cursor-pointer">
                DETAILS →
              </span>
            </div>

            <div className="border border-blue-200 rounded-lg px-4 py-3 text-sm text-gray-600 mb-4">
              1 Adult
            </div>

            <h4 className="text-sm font-medium text-gray-800 mb-3">
              Flight Summary
            </h4>

            <div className="bg-[#f3fbff] rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Departing</span>
                <span>6E 6346, A321</span>
              </div>

              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Economy | Saver
              </span>

              <div className="border rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-800">
                  Delhi – Navi Mumbai
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Thu, 29 Jan 2026 | 06:40 – 08:45 | 02h 05m | Non-Stop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Check-in: 15KG | Hand: Up to 7KG
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Banner */}
          <div className="bg-[#0b0fa8] text-white rounded-2xl p-5">
            <h4 className="text-lg font-medium mb-2">
              Our Exclusive Benefits
            </h4>
            <p className="text-sm">
              Hold fare starting at just <span className="text-3xl">₹99</span>
            </p>
            <p className="text-sm mt-1">
              6E Fare Hold – Unlimited fare surge protection
            </p>
          </div>

          {/* Fare Footer */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">TOTAL FARE</p>
              <p className="text-xl font-semibold">₹5,468</p>
              <span className="text-sm text-blue-700 cursor-pointer">
                View Details
              </span>
            </div>
            <button className="rounded-full bg-gray-300 px-6 py-3 text-white font-medium cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
