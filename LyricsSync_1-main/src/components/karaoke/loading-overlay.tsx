
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const iconVariants = {
    initial: {
        y: -20,
        scale: 0.8,
        opacity: 0,
    },
    animate: {
        y: 0,
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 10,
            repeat: Infinity,
            repeatType: 'mirror' as const,
            repeatDelay: 0.2,
            duration: 0.8,
        },
    },
};

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          <motion.div variants={iconVariants} initial="initial" animate="animate">
            <Wand2 className="h-16 w-16 text-primary" />
          </motion.div>
          <p className="mt-4 text-xl font-semibold text-foreground">Synchronizing lyrics...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
