import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Heart, Shield, Activity, CheckCircle2,
  User, Settings, Database, Zap, Star, 
  Flame, Cloud, Waves
} from 'lucide-react';

const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    animate={{
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay: delay,
    }}
  >
    {children}
  </motion.div>
);

const CircularProgress = ({ progress }) => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    initial={{ rotate: -90 }}
    animate={{ rotate: 270 }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <circle
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="rgba(255, 255, 255, 0.1)"
      strokeWidth="12"
    />
    <motion.circle
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="white"
      strokeWidth="12"
      strokeDasharray={339.292}
      strokeDashoffset={339.292 * (1 - progress)}
      strokeLinecap="round"
    />
  </motion.svg>
);

const Particle = ({ index }) => {
  const randomDelay = Math.random() * 2;
  const size = Math.random() * 4 + 2;
  
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [-20, -40, -20],
        x: [-20, 20, -20],
        scale: [1, 1.5, 1],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        delay: randomDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      initial={{ scale: 0 }}
    />
  );
};

const LoadingTransition = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    { text: 'Initializing Health Profile', icon: User, color: 'text-blue-300' },
    { text: 'Configuring Dashboard', icon: Activity, color: 'text-green-300' },
    { text: 'Encrypting Data', icon: Shield, color: 'text-purple-300' },
    { text: 'Finalizing Setup', icon: Sparkles, color: 'text-yellow-300' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (!isDone) {
        setIsDone(true);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, isDone, onComplete, steps.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev + 0.01) % 1);
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <Particle key={i} index={i} />
        ))}
        
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`,
              width: `${400 + i * 200}px`,
              height: `${400 + i * 200}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-12">
        <div className="relative mb-16">
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          >
            <CircularProgress progress={progress} />
          </motion.div>
          
          <FloatingElement>
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <Heart className="w-24 h-24 text-white" />
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </FloatingElement>
        </div>

        <div className="space-y-6 relative">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => (
              <motion.div
                key={`step-${index}`}
                className={`flex items-center justify-center gap-4 
                  ${index === currentStep ? 'text-white' : 'text-white/40'}
                `}
                initial={{ opacity: 0, x: -50 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.4,
                  x: 0,
                  transition: { delay: index * 0.2 }
                }}
                exit={{ opacity: 0, x: 50 }}
              >
                <div className="relative">
                  {index < currentStep ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-teal-300"
                    >
                      <CheckCircle2 className="w-7 h-7" />
                    </motion.div>
                  ) : (
                    <FloatingElement delay={index * 0.2}>
                      <step.icon className={`w-7 h-7 ${step.color}`} />
                    </FloatingElement>
                  )}
                  
                  {index === currentStep && (
                    <motion.div
                      className="absolute -inset-4 bg-white/10 rounded-lg -z-10"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.1, 0.2],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                <span className="text-lg font-medium">{step.text}</span>
                
                {index === currentStep && (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-white rounded-full"
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative w-80 h-2 bg-white/10 rounded-full overflow-hidden mx-auto mt-12">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep + 1) * (100 / steps.length)}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          className="absolute top-0 right-0 -translate-y-full"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <Star className="w-8 h-8 text-yellow-300/30" />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingTransition;