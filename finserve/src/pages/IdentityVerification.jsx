import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdVerified,
  MdCloudUpload,
  MdCamera,
  MdCheckCircle,
  MdPending,
  MdError,
  MdSecurity,
  MdFingerprint,
  MdLocationOn,
  MdCreditCard,
  MdPerson,
  MdHome,
  MdBadge,
  MdFaceRetouchingNatural,
} from 'react-icons/md';

const IdentityVerification = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('not_started'); // not_started, in_progress, pending_review, verified, rejected

  // Form data
  const [idType, setIdType] = useState('');
  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [ssn, setSsn] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const verificationSteps = [
    { id: 0, title: 'Personal Information', icon: <MdPerson /> },
    { id: 1, title: 'ID Document', icon: <MdBadge /> },
    { id: 2, title: 'Selfie Verification', icon: <MdFaceRetouchingNatural /> },
    { id: 3, title: 'Address Verification', icon: <MdLocationOn /> },
    { id: 4, title: 'Review & Submit', icon: <MdCheckCircle /> },
  ];

  const mockVerificationData = {
    status: 'verified',
    verifiedDate: '2025-10-20',
    idType: 'Driver\'s License',
    verificationLevel: 'Full Verification',
    riskScore: 'Low',
    checks: [
      { name: 'Identity Document', status: 'passed', date: '2025-10-20' },
      { name: 'Facial Recognition', status: 'passed', date: '2025-10-20' },
      { name: 'Liveness Detection', status: 'passed', date: '2025-10-20' },
      { name: 'Address Verification', status: 'passed', date: '2025-10-20' },
      { name: 'SSN Validation', status: 'passed', date: '2025-10-20' },
      { name: 'Sanctions Screening', status: 'passed', date: '2025-10-20' },
      { name: 'PEP Check', status: 'passed', date: '2025-10-20' },
    ],
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleFileUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded successfully');
    }
  };

  const handleNext = () => {
    if (activeStep < verificationSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmitVerification = () => {
    toast.success('Verification submitted successfully! Our team will review your documents within 24-48 hours.');
    setVerificationStatus('pending_review');
    setTimeout(() => {
      setVerificationStatus('verified');
      toast.success('Identity verified successfully!');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
                <MdArrowBack size={24} />
              </button>
              <div className="flex items-center gap-3">
                <MdSecurity className="text-primary-600 text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
                  <p className="text-sm text-gray-600">Complete KYC to unlock all features</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{currentUser?.displayName}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status Banner */}
        {verificationStatus === 'verified' && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <MdVerified className="text-green-600 text-4xl flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900 mb-2">Identity Verified</h2>
                <p className="text-green-700 mb-4">
                  Your identity has been successfully verified on {mockVerificationData.verifiedDate}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-green-600">Verification Level</p>
                    <p className="font-semibold text-green-900">{mockVerificationData.verificationLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Risk Score</p>
                    <p className="font-semibold text-green-900">{mockVerificationData.riskScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">ID Type</p>
                    <p className="font-semibold text-green-900">{mockVerificationData.idType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Status</p>
                    <p className="font-semibold text-green-900">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'pending_review' && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <MdPending className="text-yellow-600 text-4xl flex-shrink-0 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-yellow-900 mb-2">Verification Pending</h2>
                <p className="text-yellow-700">
                  Your documents are being reviewed. This usually takes 24-48 hours. We'll notify you once the review is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Checks */}
        {verificationStatus === 'verified' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verification Checks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockVerificationData.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-600 text-xl" />
                    <div>
                      <p className="font-medium text-gray-900">{check.name}</p>
                      <p className="text-xs text-gray-600">{check.date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Form */}
        {(verificationStatus === 'not_started' || verificationStatus === 'in_progress') && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Progress Steps */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                          index === activeStep
                            ? 'bg-primary-600 text-white'
                            : index < activeStep
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index < activeStep ? <MdCheckCircle /> : step.icon}
                      </div>
                      <p className="text-xs mt-2 text-center max-w-[80px] font-medium">
                        {step.title}
                      </p>
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <div
                        className={`h-1 w-12 mx-2 mb-6 ${
                          index < activeStep ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Step 0: Personal Information */}
              {activeStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600">Please provide your basic personal information</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
                      <input
                        type="text"
                        defaultValue={currentUser?.displayName || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={currentUser?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Security Number (Last 4 digits)
                      </label>
                      <input
                        type="text"
                        value={ssn}
                        onChange={(e) => setSsn(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="1234"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: ID Document */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">ID Document Upload</h2>
                  <p className="text-gray-600">Upload a clear photo of your government-issued ID</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select ID Type...</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="state_id">State ID</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Front of ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Front of ID</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                        {idFrontImage ? (
                          <div>
                            <img src={idFrontImage} alt="ID Front" className="mx-auto max-h-40 mb-4 rounded" />
                            <label className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                              Change Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setIdFrontImage)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setIdFrontImage)}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Back of ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Back of ID</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                        {idBackImage ? (
                          <div>
                            <img src={idBackImage} alt="ID Back" className="mx-auto max-h-40 mb-4 rounded" />
                            <label className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                              Change Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setIdBackImage)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setIdBackImage)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">Tips for a good ID photo:</p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Ensure all text is clearly visible</li>
                      <li>Take the photo in good lighting</li>
                      <li>Avoid glare and shadows</li>
                      <li>Capture the entire document in the frame</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Selfie Verification */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Selfie Verification</h2>
                  <p className="text-gray-600">Take a selfie to verify your identity with liveness detection</p>

                  <div className="max-w-md mx-auto">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                      {selfieImage ? (
                        <div>
                          <img src={selfieImage} alt="Selfie" className="mx-auto max-h-60 mb-4 rounded-lg" />
                          <label className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                            Retake Selfie
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setSelfieImage)}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <MdCamera className="mx-auto text-6xl text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2 font-medium">Take a Selfie</p>
                          <p className="text-sm text-gray-500 mb-4">Make sure your face is clearly visible</p>
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setSelfieImage)}
                          />
                          <div className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                            Open Camera
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-sm text-blue-900 font-medium mb-2">Selfie Requirements:</p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Face the camera directly</li>
                        <li>Remove sunglasses and hats</li>
                        <li>Ensure good lighting on your face</li>
                        <li>Show a neutral expression</li>
                        <li>Your face should match your ID photo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address Verification */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Address Verification</h2>
                  <p className="text-gray-600">Provide your residential address and proof of address</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof of Address (Utility Bill, Bank Statement, etc.)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                        {addressProof ? (
                          <div>
                            <MdCheckCircle className="mx-auto text-4xl text-green-600 mb-2" />
                            <p className="text-green-700 mb-2 font-medium">Document uploaded</p>
                            <label className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                              Change Document
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setAddressProof)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-2">Upload Proof of Address</p>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setAddressProof)}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-medium mb-2">Accepted Documents:</p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Utility bill (electricity, water, gas) - issued within last 3 months</li>
                        <li>Bank statement - issued within last 3 months</li>
                        <li>Government-issued document showing your address</li>
                        <li>Lease agreement or mortgage statement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                  <p className="text-gray-600">Please review your information before submitting</p>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdPerson className="text-primary-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Name</p>
                          <p className="font-medium">{currentUser?.displayName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date of Birth</p>
                          <p className="font-medium">{dateOfBirth || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium">{currentUser?.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">SSN (Last 4)</p>
                          <p className="font-medium">***-**-{ssn || '****'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdBadge className="text-primary-600" />
                        ID Document
                      </h3>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">Type:</p>
                        <p className="font-medium">{idType || 'Not selected'}</p>
                        {idFrontImage && idBackImage && (
                          <MdCheckCircle className="text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdFaceRetouchingNatural className="text-primary-600" />
                        Selfie Verification
                      </h3>
                      <div className="flex items-center gap-4">
                        {selfieImage ? (
                          <>
                            <MdCheckCircle className="text-green-600" />
                            <p className="text-sm font-medium text-green-700">Selfie uploaded</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">Not uploaded</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdHome className="text-primary-600" />
                        Address
                      </h3>
                      <p className="text-sm text-gray-900">
                        {address.street || 'Not provided'}<br />
                        {address.city && address.state ? `${address.city}, ${address.state} ${address.zipCode}` : 'City, State not provided'}<br />
                        {address.country}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-900 font-medium mb-2">Important:</p>
                      <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        <li>Ensure all information is accurate and matches your documents</li>
                        <li>Verification typically takes 24-48 hours</li>
                        <li>You'll receive an email once verification is complete</li>
                        <li>Providing false information may result in account suspension</li>
                      </ul>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="consent"
                        className="mt-1"
                      />
                      <label htmlFor="consent" className="text-sm text-blue-900">
                        I confirm that all information provided is accurate and I consent to the verification of this information for KYC/AML compliance purposes.
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              {activeStep < verificationSteps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmitVerification}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Submit for Verification
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;
