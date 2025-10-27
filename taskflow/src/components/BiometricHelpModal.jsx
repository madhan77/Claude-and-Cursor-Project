import { useState } from 'react';
import { MdClose, MdFingerprint, MdEmail, MdCheckCircle, MdLock, MdDevices } from 'react-icons/md';

const BiometricHelpModal = ({ isOpen, onClose, biometricType = 'Face ID / Touch ID' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Biometric Login',
      icon: <MdFingerprint className="text-6xl text-blue-600 mb-4" />,
      description: `Set up ${biometricType} for quick and secure login without passwords.`,
      details: [
        'Works with Face ID, Touch ID, Windows Hello, and fingerprint sensors',
        'Your biometric data never leaves your device',
        'Fast, secure, and convenient authentication',
      ],
    },
    {
      title: 'Step 1: Enter Your Email',
      icon: <MdEmail className="text-6xl text-blue-600 mb-4" />,
      description: 'Start by entering your email address in the login form.',
      details: [
        'Type your registered email address',
        'Make sure it\'s the email you use for your account',
        'The biometric credential will be linked to this email',
      ],
      visual: (
        <div className="bg-gray-100 p-4 rounded-lg mt-4">
          <div className="bg-white p-3 rounded border border-gray-300 flex items-center gap-2">
            <MdEmail className="text-gray-400" />
            <span className="text-gray-500">your.email@example.com</span>
          </div>
        </div>
      ),
    },
    {
      title: `Step 2: Click Setup ${biometricType}`,
      icon: <MdFingerprint className="text-6xl text-purple-600 mb-4" />,
      description: `After entering your email, click the "${biometricType}" button.`,
      details: [
        `Look for the purple button that says "Setup ${biometricType}"`,
        'This button appears below the Google sign-in option',
        'It will only show if your device supports biometric authentication',
      ],
      visual: (
        <div className="bg-gray-100 p-4 rounded-lg mt-4">
          <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold">
            <MdFingerprint className="text-2xl" />
            Setup {biometricType}
          </button>
        </div>
      ),
    },
    {
      title: 'Step 3: Authenticate',
      icon: <MdLock className="text-6xl text-green-600 mb-4" />,
      description: 'Your browser will prompt you to authenticate with your device.',
      details: [
        'Mac: Use Touch ID or Face ID when prompted',
        'iPhone/iPad: Use Face ID or Touch ID',
        'Windows: Use Windows Hello (face, fingerprint, or PIN)',
        'Android: Use fingerprint or face unlock',
      ],
      visual: (
        <div className="bg-gray-100 p-4 rounded-lg mt-4 text-center">
          <div className="bg-white p-6 rounded-lg border-2 border-blue-500 inline-block">
            <MdFingerprint className="text-5xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Browser Prompt</p>
            <p className="text-xs text-gray-600">Authenticate to continue</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Success! You\'re All Set',
      icon: <MdCheckCircle className="text-6xl text-green-600 mb-4" />,
      description: `${biometricType} is now set up for your account.`,
      details: [
        'Next time, just enter your email and click the login button',
        'Your biometric credential is stored securely on this device',
        'You\'ll need to set it up separately on other devices',
      ],
      visual: (
        <div className="bg-green-50 p-4 rounded-lg mt-4 border border-green-200">
          <div className="flex items-center gap-3">
            <MdCheckCircle className="text-3xl text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Setup Complete!</p>
              <p className="text-sm text-green-700">You can now login with {biometricType}</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              How to Setup {biometricType}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <MdClose size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {currentStepData.icon}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          {currentStepData.visual && (
            <div className="mb-6">{currentStepData.visual}</div>
          )}

          <div className="bg-blue-50 rounded-lg p-4">
            <ul className="space-y-2">
              {currentStepData.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <MdCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Notes */}
          {currentStep === 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MdDevices className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900 text-sm">Device Requirements:</p>
                  <p className="text-yellow-800 text-sm mt-1">
                    Your device must have Face ID, Touch ID, Windows Hello, or a fingerprint sensor.
                    You must be accessing this site via HTTPS or localhost.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded-lg transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white font-semibold hover:bg-green-700 rounded-lg transition"
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricHelpModal;
