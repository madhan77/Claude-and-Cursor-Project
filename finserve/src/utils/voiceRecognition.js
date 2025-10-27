// Voice Recognition using Web Speech API

export const isVoiceRecognitionAvailable = () => {
  return (
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );
};

export const createVoiceRecognition = () => {
  if (!isVoiceRecognitionAvailable()) {
    throw new Error('Voice recognition is not supported in this browser');
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  return recognition;
};

export const startVoiceInput = (onResult, onError) => {
  try {
    const recognition = createVoiceRecognition();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      if (onResult) {
        onResult(transcript, confidence);
      }
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      if (onError) {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      // Recognition has stopped
    };

    recognition.start();
    return recognition;
  } catch (error) {
    console.error('Failed to start voice recognition:', error);
    if (onError) {
      onError(error);
    }
    return null;
  }
};

export const stopVoiceInput = (recognition) => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }
};

// Voice commands parser for login
export const parseLoginCommand = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();

  // Check for email input
  if (lowerTranscript.includes('email') || lowerTranscript.includes('my email is')) {
    const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      return { type: 'email', value: emailMatch[0] };
    }
  }

  // Check for password input
  if (lowerTranscript.includes('password') || lowerTranscript.includes('my password is')) {
    const passwordPart = transcript.split(/password is |password /i)[1];
    if (passwordPart) {
      return { type: 'password', value: passwordPart.trim() };
    }
  }

  // Check for login command
  if (lowerTranscript.includes('login') || lowerTranscript.includes('sign in')) {
    return { type: 'submit' };
  }

  // Check for biometric command
  if (lowerTranscript.includes('face id') || lowerTranscript.includes('biometric')) {
    return { type: 'biometric' };
  }

  return { type: 'unknown', value: transcript };
};

// Text to Speech for voice feedback
export const speakText = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
