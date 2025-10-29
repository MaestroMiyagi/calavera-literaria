import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CalaveraDisplayProps {
  stanzas: string[];
  isPlaying?: boolean;
}

export default function CalaveraDisplay({ stanzas, isPlaying = false }: CalaveraDisplayProps) {
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const stanzaVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={titleVariants}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-['Great_Vibes'] text-calavera mb-4">
          Calavera Literaria
        </h1>
        <motion.div
          animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl md:text-3xl text-gray-300"
        >
          💀
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {stanzas.map((stanza, index) => (
          <motion.div
            key={index}
            variants={stanzaVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`
              bg-linear-to-br from-gray-900 to-black
              border border-gray-800
              rounded-lg p-6 md:p-8
              shadow-xl
              hover:border-calavera
              hover:shadow-calavera/20
              transition-all duration-300
              ${isPlaying ? 'animate-pulse-subtle' : ''}
            `}
          >
            <p
              className="
                text-lg md:text-xl
                leading-relaxed
                font-['Dancing_Script']
                text-gray-100
                whitespace-pre-wrap
                font-medium
              "
            >
              {stanza}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Decoraciones con animación */}
      {windowDimensions.width > 0 && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-10"
              initial={{
                x: Math.random() * windowDimensions.width,
                y: -50,
                rotate: 0,
              }}
              animate={{
                y: windowDimensions.height + 50,
                rotate: 360,
                transition: {
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 2,
                },
              }}
            >
              💀
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
