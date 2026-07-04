import { useState, useRef, useCallback, useEffect } from 'react';
import type { SupportedLanguage } from '../api/ai/prompts';

// Maps KrishiMitra languages to BCP-47 codes for SpeechRecognition
export const LANGUAGE_TO_BCP47: Record<SupportedLanguage, string> = {
  English: 'en-IN',
  Hindi:   'hi-IN',
  Bengali: 'bn-IN',
};

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(language: SupportedLanguage): UseSpeechRecognitionReturn {
  const [isListening, setIsListening]           = useState(false);
  const [transcript, setTranscript]             = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError]                       = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const langRef = useRef(language);
  langRef.current = language; // always fresh inside callbacks

  // Check support once — avoids repeated property lookups
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }

    // Abort any existing recognition session first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SR();

    recognition.lang             = LANGUAGE_TO_BCP47[langRef.current];
    recognition.interimResults   = true;   // show what user is saying in real-time
    recognition.maxAlternatives  = 1;
    recognition.continuous       = false;  // one utterance per push

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalPart   = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalPart += result[0].transcript;
        } else {
          interimPart += result[0].transcript;
        }
      }

      if (finalPart)   setTranscript(prev => prev + finalPart);
      setInterimTranscript(interimPart);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission denied. Please allow microphone access in your browser.');
      } else if (event.error === 'network') {
        setError('Network error during voice recognition. Please check your connection.');
      } else {
        setError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      // .stop() triggers onend which calls setIsListening(false)
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
