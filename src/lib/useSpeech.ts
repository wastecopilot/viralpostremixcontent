"use client";

// Voice typing with the browser's built-in Web Speech API (works best in Chrome and Edge).

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResultItem {
  transcript: string;
}
interface SpeechResult {
  isFinal: boolean;
  0: SpeechResultItem;
}
interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}
interface Recognizer {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognizerConstructor = new () => Recognizer;

function getRecognizer(): RecognizerConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognizerConstructor; webkitSpeechRecognition?: RecognizerConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow the microphone for this site in your browser, then try again.",
  "service-not-allowed": "Microphone access was blocked. Allow the microphone for this site in your browser, then try again.",
  "no-speech": "We didn't hear anything. Tap the microphone and try again.",
  "audio-capture": "No microphone was found. Check that one is connected.",
  network: "Voice typing needs an internet connection.",
};

/**
 * `start(baseText, onText)` begins listening; onText receives baseText + what you said so far.
 */
export function useSpeech() {
  const recognizerRef = useRef<Recognizer | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => recognizerRef.current?.abort(), []);

  const stop = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  const start = useCallback((baseText: string, onText: (text: string) => void) => {
    const Ctor = getRecognizer();
    if (!Ctor) {
      setError("Voice typing isn't supported in this browser. Try Google Chrome or Microsoft Edge, or just type.");
      return;
    }
    setError(null);
    const recognizer = new Ctor();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = navigator.language || "en-US";
    let finalText = "";
    const prefix = baseText.trim() ? `${baseText.trimEnd()} ` : "";
    recognizer.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      onText(prefix + (finalText + interim).trim());
    };
    recognizer.onerror = (event) => {
      if (event.error !== "aborted") setError(ERRORS[event.error] ?? "Voice typing stopped unexpectedly. Please try again.");
    };
    recognizer.onend = () => {
      setListening(false);
      recognizerRef.current = null;
    };
    recognizerRef.current = recognizer;
    try {
      recognizer.start();
      setListening(true);
    } catch {
      setError("Couldn't start the microphone. Please try again.");
    }
  }, []);

  return { listening, error, start, stop };
}
