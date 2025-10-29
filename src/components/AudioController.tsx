import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type AudioState = 'idle' | 'playing' | 'paused' | 'ended';

interface AudioControllerProps {
  calavera: string;
  onStateChange?: (state: AudioState) => void;
}

export default function AudioController({ calavera, onStateChange }: AudioControllerProps) {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  
  const soundEffectsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.error('Web Speech API no está soportada en este navegador');
    }

    
    const soundFiles = {
      laugh: '/sounds/laugh.mp3',
      chains: '/sounds/chains.mp3',
      steps: '/sounds/steps.mp3',
      dramatic: '/sounds/dramatic.mp3',
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.onerror = () => {
        console.warn(`No se pudo cargar el efecto de sonido: ${path}`);
      };
      soundEffectsRef.current[key] = audio;
    });

    return () => {
      
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playSoundEffect = (effect: string) => {
    const audio = soundEffectsRef.current[effect];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn(`Error reproduciendo ${effect}:`, err));
    }
  };

  const handlePlay = () => {
    if (!isSupported) {
      alert('Tu navegador no soporta Text-to-Speech. Por favor usa Chrome, Edge o Safari.');
      return;
    }

    
    window.speechSynthesis.cancel();

    
    const utterance = new SpeechSynthesisUtterance(calavera);
    utteranceRef.current = utterance;

    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((voice) => voice.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'es-MX';

    
    utterance.onstart = () => {
      setAudioState('playing');
      onStateChange?.('playing');
      playSoundEffect('dramatic');
    };

    utterance.onend = () => {
      setAudioState('ended');
      onStateChange?.('ended');
      playSoundEffect('laugh');
    };

    utterance.onerror = (event) => {
      console.error('Error en TTS:', event);
      setAudioState('idle');
      onStateChange?.('idle');
    };

    
    utterance.onboundary = (event) => {
      const text = calavera.substring(0, event.charIndex);

      
      if (text.includes('la Calaca') && !text.includes('la Calaca, la mera-mera')) {
        playSoundEffect('chains');
      }

      
      if (text.includes('entró Aaron')) {
        playSoundEffect('steps');
      }
    };

    
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setAudioState('paused');
      onStateChange?.('paused');
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setAudioState('playing');
      onStateChange?.('playing');
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setAudioState('idle');
    onStateChange?.('idle');
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex gap-4 flex-wrap justify-center">
        {audioState === 'idle' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="px-8 py-4 bg-calavera text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-[#d47005] transition-colors"
          >
            ▶ Reproducir Calavera
          </motion.button>
        )}

        {audioState === 'playing' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-600 transition-colors"
            >
              ⏸ Pausar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="px-8 py-4 bg-red-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-red-600 transition-colors"
            >
              ⏹ Detener
            </motion.button>
          </>
        )}

        {audioState === 'paused' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResume}
              className="px-8 py-4 bg-calavera text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-[#d47005] transition-colors"
            >
              ▶ Continuar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="px-8 py-4 bg-red-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-red-600 transition-colors"
            >
              ⏹ Detener
            </motion.button>
          </>
        )}

        {audioState === 'ended' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReplay}
            className="px-8 py-4 bg-calavera text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-[#d47005] transition-colors"
          >
            🔄 Volver a Reproducir
          </motion.button>
        )}
      </div>

      {!isSupported && (
        <p className="text-red-400 text-sm mt-2">
          Tu navegador no soporta Text-to-Speech. Por favor usa Chrome, Edge o Safari.
        </p>
      )}

      {audioState === 'playing' && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-calavera text-sm"
        >
          Reproduciendo...
        </motion.div>
      )}
    </div>
  );
}
