import React from 'react';
import { PageTutorialModal } from './PageTutorialModal';

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  currentView: string;
}

export const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose, onNavigate, currentView }) => {
  return (
    <PageTutorialModal
      isOpen={isOpen}
      onClose={() => {
        try {
          localStorage.setItem('has_seen_tutorial', 'true');
        } catch {}
        onClose();
      }}
      currentView={currentView}
      onNavigate={(v) => onNavigate(v)}
    />
  );
};

export default AppTutorial;
