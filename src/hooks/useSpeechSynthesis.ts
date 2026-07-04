import { useState, useCallback, useRef, useEffect } from 'react';
import type { SupportedLanguage } from '../api/ai/prompts';

// BCP-47 language codes for TTS voice matching
// Multiple fallbacks per language in priority order
const LANGUAGE_VOICE_CODES: Record<SupportedLanguage, string[]> = {
  English: ['en-IN', 'en-US', 'en-GB', 'en'],
  Hindi:   ['hi-IN', 'hi'],
  Bengali: ['bn-IN', 'bn-BD', 'bn'],
  Odia:    ['or-IN', 'hi-IN', 'hi'],  // Odia not widely available, falls back to Hindi
};

/** Find the best matching SpeechSynthesis voice for a given language. */
function findBestVoice(language: SupportedLanguage): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const codes = LANGUAGE_VOICE_CODES[language];

  // Try exact match first (e.g. hi-IN)
  for (const code of codes) {
    const exact = voices.find(v => v.lang === code);
    if (exact) return exact;
  }

  // Try prefix match (e.g. "hi" matches "hi-IN")
  for (const code of codes) {
    const prefix = code.split('-')[0];
    const match = voices.find(v => v.lang.startsWith(prefix));
    if (match) return match;
  }

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
    .replace(/[>#_~|]/g, '')              // remaining special chars
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
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voice = findBestVoice(language);
        if (voice) utterance.voice = voice;

        utterance.lang   = LANGUAGE_VOICE_CODES[language][0];
        utterance.rate   = 0.92;  // slightly slower for clarity
        utterance.pitch  = 1.05;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);

        utterance.onend = () => {
          setIsSpeaking(false);
          onEndRef.current?.();
          onEndRef.current = undefined;
        };

        utterance.onerror = (e) => {
          // "interrupted" is normal when user triggers stop() mid-sentence
          if (e.error !== 'interrupted') {
            console.warn('TTS error:', e.error);
          }
          setIsSpeaking(false);
          onEndRef.current = undefined;
        };

        window.speechSynthesis.speak(utterance);
      };

      // Voices may not be ready yet on first load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      }
    },
    [isSupported]
  );

  // Safari / some Chromium builds have a bug where synthesis pauses after ~15s.
  // This keep-alive workaround resumes it periodically while speaking.
  useEffect(() => {
    if (!isSupported) return;
    const interval = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isSupported]);

  // Cancel speech when component unmounts
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { isSpeaking, speak, stop, isSupported };
}
