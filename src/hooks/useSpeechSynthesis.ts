import { useState, useCallback, useRef, useEffect } from 'react';
import type { SupportedLanguage } from '../api/ai/prompts';
import { toast } from 'react-hot-toast';

const LANGUAGE_VOICE_CODES: Record<SupportedLanguage, string[]> = {
  English: ['en-IN', 'en-US', 'en-GB', 'en'],
  Hindi: ['hi-IN', 'hi'],
  Bengali: ['bn-IN', 'bn-BD', 'bn'],
};

/** Find the best matching SpeechSynthesis voice for a given language. */
function findBestVoice(language: SupportedLanguage): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const codes = LANGUAGE_VOICE_CODES[language] || LANGUAGE_VOICE_CODES['English'];

  // Try exact match first (e.g. hi-IN)
  for (const code of codes) {
    const exact = voices.find(v => v.lang.toLowerCase() === code.toLowerCase());
    if (exact) return exact;
  }

  // Try prefix match (e.g. "hi" matches "hi-IN")
  for (const code of codes) {
    const prefix = code.split('-')[0].toLowerCase();
    const match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;
  }

  // Try matching the language name itself in the voice name (e.g. "Hindi" inside "Microsoft Swara - Hindi")
  const langName = language.toLowerCase();
  const nameMatch = voices.find(v => v.name.toLowerCase().includes(langName));
  if (nameMatch) return nameMatch;

  // Absolute fallback — first available voice
  return voices[0];
}

/**
 * Strip markdown formatting so the TTS reads clean prose instead of
 * "asterisk asterisk bold text asterisk asterisk".
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')            // headings
    .replace(/\*\*(.*?)\*\*/g, '$1')      // bold
    .replace(/\*(.*?)\*/g, '$1')          // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')   // code spans / blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → link text only
    .replace(/^[-*+]\s+/gm, '')           // list bullet chars
    .replace(/^\d+\.\s+/gm, '')          // numbered list prefixes
    .replace(/[>#_~|*`"-]/g, '')         // remaining special chars including asterisks and quotes
    .replace(/\n{2,}/g, '. ')            // paragraph breaks → short pause
    .replace(/\n/g, ' ')                  // single newlines → space
    .replace(/\s{2,}/g, ' ')             // collapse whitespace
    .trim();
}

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  speak: (text: string, language: SupportedLanguage, onEnd?: () => void) => void;
  stop: () => void;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onEndRef.current = undefined;
  }, [isSupported]);

  const speak = useCallback(
    (text: string, language: SupportedLanguage, onEnd?: () => void) => {
      if (!isSupported) return;

      // Cancel any currently playing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      const cleanText = stripMarkdown(text);
      if (!cleanText.trim()) {
        onEnd?.();
        return;
      }

      onEndRef.current = onEnd;

      const doSpeak = () => {
        console.log('TTS starting with text:', cleanText);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voice = findBestVoice(language);
        if (voice) {
          utterance.voice = voice;
          console.log('TTS selected voice:', voice.name, voice.lang);
        } else {
          console.log('TTS could not find a specific voice, using default browser voice.');
        }

        utterance.lang = LANGUAGE_VOICE_CODES[language]?.[0] || 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          console.log('TTS utterance started');
          toast.success('Reading aloud...', { id: 'tts-toast', duration: 2000, position: 'bottom-center' });
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('TTS utterance ended');
          setIsSpeaking(false);
          onEndRef.current?.();
          onEndRef.current = undefined;
          utteranceRef.current = null;
        };

        utterance.onerror = (e) => {
          console.error('TTS error event:', e.error, e);
          toast.error(`Browser voice error: ${e.error}`, { id: 'tts-toast', duration: 4000 });
          setIsSpeaking(false);
          onEndRef.current = undefined;
          utteranceRef.current = null;
        };

        utteranceRef.current = utterance;

        try {
          window.speechSynthesis.speak(utterance);
        } catch (err: any) {
          toast.error(`Speech failed: ${err.message}`, { id: 'tts-toast' });
        }
      };

      // In Chrome, if voices are empty, they might load later, but we shouldn't completely block speech
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        console.log('TTS voices not loaded yet, attaching voiceschanged listener and trying anyway...');
        window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
        // Fallback: Try speaking anyway just in case the browser supports it without explicitly loading the voice list
        doSpeak();
      }
    },
    [isSupported]
  );

  // Cancel speech when component unmounts
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { isSpeaking, speak, stop, isSupported };
}
