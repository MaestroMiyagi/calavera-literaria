import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalaveraPlayerProps {
  stanzas: string[][];
}

type PlayState = 'idle' | 'playing' | 'paused' | 'ended';

export default function CalaveraPlayer({ stanzas }: CalaveraPlayerProps) {
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [currentStanzaIndex, setCurrentStanzaIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup al desmontar
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const playStanza = (index: number) => {
    if (index >= stanzas.length) {
      // Terminamos todas las estrofas
      setPlayState('ended');
      return;
    }

    setCurrentStanzaIndex(index);

    // Crear el audio para esta estrofa
    const audioPath = `/sounds/stanza${index + 1}.wav`;
    const audio = new Audio(audioPath);
    currentAudioRef.current = audio;

    let audioLoaded = false;
    let fallbackTimer: NodeJS.Timeout | null = null;

    // Cuando el audio termine, pasar a la siguiente estrofa
    const handleEnded = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      playStanza(index + 1);
    };

    // Si el audio carga correctamente, reproducirlo
    const handleCanPlay = () => {
      audioLoaded = true;
      audio.play().catch((err) => {
        console.warn(`Error reproduciendo audio de estrofa ${index + 1}:`, err);
        // Si falla la reproducción, usar fallback
        useFallback();
      });
    };

    // Si el audio no se puede cargar, usar fallback
    const handleError = () => {
      console.warn(`No se pudo cargar audio para estrofa ${index + 1}, usando fallback de 10 segundos`);
      useFallback();
    };

    const useFallback = () => {
      fallbackTimer = setTimeout(() => {
        playStanza(index + 1);
      }, 10000); // 10 segundos de fallback
      fallbackTimerRef.current = fallbackTimer;
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Si después de 500ms no ha cargado, asumir que no existe y usar fallback
    setTimeout(() => {
      if (!audioLoaded) {
        handleError();
      }
    }, 500);
  };

  const handlePlay = () => {
    setPlayState('playing');
    setCurrentStanzaIndex(0);
    setShowAll(false);
    playStanza(0);
  };

  const handlePause = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    setPlayState('paused');
  };

  const handleResume = () => {
    setPlayState('playing');
    if (currentAudioRef.current && currentAudioRef.current.paused) {
      // Si hay un audio pausado, continuar
      currentAudioRef.current.play().catch((err) => {
        console.warn('Error al reanudar:', err);
      });
    } else {
      // Si no hay audio o no se puede reanudar, continuar desde la estrofa actual
      playStanza(currentStanzaIndex);
    }
  };

  const handleStop = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    setPlayState('idle');
    setCurrentStanzaIndex(0);
  };

  const handleShowAll = () => {
    setShowAll(true);
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  if (showAll) {
    return (
      <div className="h-screen w-screen flex flex-col">
        {/* Título y controles fijos */}
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-4xl font-['Great_Vibes'] text-calavera pt-10">
              Calavera Literaria
            </h1>
          </motion.div>

          {/* Controles */}
          <div className="flex gap-4 flex-wrap justify-center mt-4">
            {playState === 'playing' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold shadow-lg hover:bg-gray-600 transition-colors"
                >
                  ⏸ Pausar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg font-semibold shadow-lg hover:bg-red-600 transition-colors"
                >
                  ⏹ Detener
                </motion.button>
              </>
            )}

            {playState === 'paused' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResume}
                  className="px-6 py-2 bg-calavera text-white rounded-lg font-semibold shadow-lg hover:bg-[#d47005] transition-colors"
                >
                  ▶ Continuar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg font-semibold shadow-lg hover:bg-red-600 transition-colors"
                >
                  ⏹ Detener
                </motion.button>
              </>
            )}

            {(playState === 'idle' || playState === 'ended') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAll(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold shadow-lg hover:bg-gray-600 transition-colors"
              >
                ← Volver
              </motion.button>
            )}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {stanzas.map((stanza, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`text-center space-y-2 ${
                  index === currentStanzaIndex && playState === 'playing'
                    ? 'text-calavera'
                    : 'text-gray-100'
                } transition-colors duration-500`}
              >
                {stanza.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-xl md:text-2xl font-['Inter']">
                    {line}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mx-8 fixed top-0 left-0 right-0 mt-6"
      >
        <h1 className="text-5xl md:text-7xl font-['Great_Vibes'] text-calavera mb-4">
          Calavera Literaria
        </h1>
        <motion.div
          animate={playState === 'playing' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl text-gray-300"
        >
          💀
        </motion.div>
      </motion.div>

      {/* Estrofa actual centrada */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {playState !== 'idle' && playState !== 'ended' && (
            <motion.div
              key={currentStanzaIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-3"
            >
              {stanzas[currentStanzaIndex]?.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-2xl md:text-3xl font-['Inter'] text-calavera"
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <div className="flex gap-4 flex-wrap justify-center">
          {playState === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="px-2 py-2 bg-calavera text-white rounded-lg font-semibold text-md shadow-lg hover:bg-[#d47005] transition-colors"
            >
              ▶ Reproducir Calavera
            </motion.button>
          )}

          {playState === 'playing' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="px-2 py-2 bg-gray-700 text-white rounded-lg font-semibold text-md shadow-lg hover:bg-gray-600 transition-colors"
              >
                ⏸ Pausar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="px-2 py-2 bg-red-700 text-white rounded-lg font-semibold text-md shadow-lg hover:bg-red-600 transition-colors"
              >
                ⏹ Detener
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowAll}
                className="px-2 py-2 border-white border text-white rounded-lg font-semibold text-md shadow-lg transition-colors"
              >
                Mostrar Todo
              </motion.button>
            </>
          )}

          {playState === 'paused' && (
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowAll}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 transition-colors"
              >
                📜 Mostrar Todo
              </motion.button>
            </>
          )}

          {playState === 'ended' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReplay}
                className="px-8 py-4 bg-calavera text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-[#d47005] transition-colors"
              >
                🔄 Volver a Reproducir
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowAll}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 transition-colors"
              >
                📜 Ver Toda la Calavera
              </motion.button>
            </>
          )}
        </div>

        {playState === 'playing' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-calavera text-sm"
          >
            Estrofa {currentStanzaIndex + 1} de {stanzas.length}
          </motion.div>
        )}
      </div>
    </div>
  );
}
