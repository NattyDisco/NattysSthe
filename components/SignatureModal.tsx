import React, { useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import { useI18n } from '../hooks/useI18n';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, documentId }) => {
    const { signDocument } = useAppContext();
    const { t } = useI18n();
    const signaturePadRef = useRef<SignaturePadRef>(null);
    
    const handleSave = () => {
        if (signaturePadRef.current && documentId) {
            const signatureData = signaturePadRef.current.getSignature();
            if (signatureData) {
                signDocument(documentId, signatureData);
                onClose();
            } else {
                alert('Please provide a signature.');
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{t('modals.signature.title')}</h2>
                <div className="h-64 border rounded-md">
                    <SignaturePad ref={signaturePadRef} />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={() => signaturePadRef.current?.clear()} className="px-4 py-2 bg-slate-200 rounded-md">{t('common.clear')}</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('modals.signature.sign_button')}</button>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal;
