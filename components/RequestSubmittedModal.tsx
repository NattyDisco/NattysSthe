
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from './icons';

interface RequestSubmittedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const RequestSubmittedModal: React.FC<RequestSubmittedModalProps> = ({ isOpen, onClose, title, message }) => {
  // FIX: Cast motion.div to any to avoid type errors with motion props.
  const MotionDiv = motion.div as any;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestSubmittedModal;
