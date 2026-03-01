import { useCallback, useEffect, useRef } from "react";

const STYLE_CONFIGS = {
  calm: {
    hints: ["aria", "samantha", "jenny", "female", "google us english"],
    baseRate: 0.9,
    rateStep: 0.02,
    basePitch: 1.05,
    pitchStep: 0.02,
    excitementBoost: 0.02,
  },
  cheerful: {
    hints: ["jenny", "zira", "samantha", "female", "child"],
    baseRate: 0.96,
    rateStep: 0.04,
    basePitch: 1.22,
    pitchStep: 0.05,
    excitementBoost: 0.05,
  },
  superFun: {
    hints: ["zira", "jenny", "aria", "female", "child"],
    baseRate: 1.02,
    rateStep: 0.06,
    basePitch: 1.3,
    pitchStep: 0.07,
    excitementBoost: 0.08,
  },
};

const splitForSpeech = (text) => {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 6);
};

export default function useTextToSpeech() {
  const voiceRef = useRef(null);
  const voicesRef = useRef([]);

  const chooseBestVoice = useCallback((style = "cheerful") => {
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis?.getVoices?.() || [];
    if (!voices.length) return null;

    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.cheerful;
    const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
    const pool = englishVoices.length ? englishVoices : voices;

    const preferred = pool.find((voice) => {
      const name = voice.name.toLowerCase();
      return styleConfig.hints.some((hint) => name.includes(hint));
    });

    return preferred || pool[0] || null;
  }, []);

  useEffect(() => {
    voicesRef.current = window.speechSynthesis?.getVoices?.() || [];
    voiceRef.current = chooseBestVoice("cheerful");

    const onVoicesChanged = () => {
      voicesRef.current = window.speechSynthesis?.getVoices?.() || [];
      voiceRef.current = chooseBestVoice("cheerful");
    };

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [chooseBestVoice]);

  const speak = useCallback((text, style = "cheerful") => {
    if (!text) return;
    const chunks = splitForSpeech(text);
    if (!chunks.length) return;

    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.cheerful;

    window.speechSynthesis.cancel();
    voiceRef.current = chooseBestVoice(style);

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.voice = voiceRef.current;
      utterance.volume = 1;
      utterance.pitch =
        styleConfig.basePitch + (index % 2 === 0 ? styleConfig.pitchStep : -styleConfig.pitchStep / 2);
      utterance.rate = styleConfig.baseRate + (index % 3) * styleConfig.rateStep;

      if (/!/.test(chunk)) {
        utterance.pitch += styleConfig.excitementBoost;
      }

      window.speechSynthesis.speak(utterance);
    });
  }, [chooseBestVoice]);

  return { speak };
}