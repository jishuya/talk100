import React from 'react';
import { Button } from '../ui/Button';

const SettingsHeader = ({ onBackClick, onSaveClick, isSaving = false }) => {
  return (
    <header className="bg-white px-4 py-4 shadow-lg sticky top-0 z-[100] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 text-xl text-text-primary"
          onClick={onBackClick}
        >
          ←
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">설정</h1>
      </div>
      <Button
        variant="primary"
        size="sm"
        className="px-4 py-2 rounded-full text-sm font-semibold touchable"
        onClick={onSaveClick}
        disabled={isSaving}
      >
        {isSaving ? '저장 중...' : '저장'}
      </Button>
    </header>
  );
};

export default SettingsHeader;