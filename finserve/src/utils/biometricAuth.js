// Biometric Authentication using Web Authentication API (WebAuthn)
// Supports Face ID, Touch ID, Windows Hello, and other biometric methods

export const isBiometricAvailable = () => {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined
  );
};

export const registerBiometric = async (userEmail) => {
  if (!isBiometricAvailable()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    // Create a challenge (in production, this should come from your server)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'FinServe',
        id: window.location.hostname,
      },
      user: {
        id: new Uint8Array(16),
        name: userEmail,
        displayName: userEmail,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (Face ID, Touch ID, Windows Hello)
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    // Store credential ID for future authentication
    if (credential) {
      const credentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );
      localStorage.setItem(`biometric_${userEmail}`, credentialId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Biometric registration error:', error);
    throw error;
  }
};

export const authenticateWithBiometric = async (userEmail) => {
  if (!isBiometricAvailable()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    const storedCredentialId = localStorage.getItem(`biometric_${userEmail}`);
    if (!storedCredentialId) {
      throw new Error('No biometric credential found. Please register first.');
    }

    // Create a challenge (in production, this should come from your server)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credentialIdBuffer = Uint8Array.from(atob(storedCredentialId), (c) =>
      c.charCodeAt(0)
    );

    const publicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: credentialIdBuffer,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      timeout: 60000,
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return assertion !== null;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    throw error;
  }
};

export const isBiometricRegistered = (userEmail) => {
  return localStorage.getItem(`biometric_${userEmail}`) !== null;
};

export const removeBiometric = (userEmail) => {
  localStorage.removeItem(`biometric_${userEmail}`);
};

export const getBiometricType = () => {
  const platform = navigator.platform || navigator.userAgentData?.platform || 'unknown';

  if (platform.includes('Mac') || platform.includes('iPhone') || platform.includes('iPad')) {
    return 'Face ID / Touch ID';
  } else if (platform.includes('Win')) {
    return 'Windows Hello';
  } else if (platform.includes('Android')) {
    return 'Biometric';
  }

  return 'Biometric';
};
