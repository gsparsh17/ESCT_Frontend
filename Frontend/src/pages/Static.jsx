import { useState } from 'react';

// Main component to render About, Privacy, or Terms pages
const LegalPages = () => {
  const [activeTab, setActiveTab] = useState('About');

  const content = {
    About: {
      title: 'About ESCT',
      body: (
        <>
          <p className="mt-4 text-base text-gray-700">
            ESCT (Employee Self Care Team) is an initiative designed to provide timely and transparent financial support to government employees and pensioners in times of need. Our core mission is to foster a community built on compassion, ensuring that help is always available to those who have dedicated their service.
          </p>
          <p className="mt-4 text-base text-gray-700">
            Through a structured and verified system, we facilitate donations for specific claim categories like **Retirement**, **Death After Service**, and **Death During Service**. Every action on our platform, from user registration to beneficiary claims, is subject to a rigorous verification process to maintain the integrity and trust of our community.
          </p>
          <p className="mt-4 text-base text-gray-700">
            We believe that a small, consistent contribution can make a monumental difference. Our platform empowers members to easily contribute to their peers and see the direct impact of their support, making compassion a simple, tangible action.
          </p>
        </>
      ),
    },
    Privacy: {
      title: 'Privacy Policy',
      body: (
        <>
          <p className="mt-4 text-base text-gray-700">
            We are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Data Collection & Verification</h3>
          <p className="mt-2 text-base text-gray-700">
            During registration, we collect your EHRMS/Pensioner number. This information is used for instant verification via an integrated ML model that auto-fills your Name, Date of Birth, and other employment details. These details are read-only and cannot be changed after verification to prevent identity fraud and ensure data integrity.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Use of Information</h3>
          <p className="mt-2 text-base text-gray-700">
            Your personal data is used exclusively for service delivery, including processing donations, managing claims, and sending relevant notifications. We do not share your personal information with third parties except as required for service functionality (e.g., Razorpay for payment processing) or legal compliance.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Security</h3>
          <p className="mt-2 text-base text-gray-700">
            We use industry-standard security measures to protect your data. Your bank details and other sensitive information are handled with the highest level of encryption and are not stored in a manner that compromises your security.
          </p>
        </>
      ),
    },
    Terms: {
      title: 'Terms & Conditions',
      body: (
        <>
          <p className="mt-4 text-base text-gray-700">
            By using the ESCT platform, you agree to the following terms.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Membership & Donations</h3>
          <p className="mt-2 text-base text-gray-700">
            An annual membership fee of **₹51** is required to maintain an active account. Members are also subject to a monthly donation obligation, which is a key part of our community-driven support model. Failure to meet these obligations may result in account suspension.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Claim Eligibility</h3>
          <p className="mt-2 text-base text-gray-700">
            Eligibility for applying as a beneficiary is contingent upon consistent participation. You must have completed your mandatory monthly donations for a minimum period of six months to be eligible to apply for a claim. All claims are subject to a multi-stage verification process by our ground and admin teams.
          </p>
          <h3 className="mt-6 text-lg font-bold text-teal-800">Refunds</h3>
          <p className="mt-2 text-base text-gray-700">
            All donations made through the ESCT platform are non-refundable. Donations are a voluntary contribution to a beneficiary and cannot be reclaimed once the transaction is completed.
          </p>
        </>
      ),
    },
  };

  const activeContent = content[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 lg:-m-6 -m-2">
      {/* Header with Background Gradient */}
      <div className="rounded-b-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold">{activeContent.title}</h1>
          <p className="mt-2 text-lg font-medium opacity-90">
            Comprehensive details about our mission, policies, and commitments.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-4 px-4">
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-200">
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['About', 'Privacy', 'Terms'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab 
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content Body */}
          <div className="mt-6">
            {activeContent.body}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;
