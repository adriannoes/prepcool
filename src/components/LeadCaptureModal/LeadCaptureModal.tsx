import React, { useState } from 'react';
import LeadCaptureDialog from './LeadCaptureDialog';
import type { LeadCaptureModalProps } from './types';

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose }) => {
  return (
    <LeadCaptureDialog isOpen={isOpen} onClose={onClose} />
  );
};

export default LeadCaptureModal; 