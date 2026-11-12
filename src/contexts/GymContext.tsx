import React, { createContext, useContext, useState, useEffect } from 'react';
import { Gym } from '../types/database';
import { AppStorage, DATA_CHANGE_EVENT } from '../lib/storage';

interface GymContextType {
  currentGym: Gym;
  allGyms: Gym[];
  switchGym: (gymId: string) => void;
  updateGymSettings: (updated: Partial<Gym>) => void;
  refresh: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGym, setCurrentGym] = useState<Gym>(AppStorage.getCurrentGym());
  const [allGyms, setAllGyms] = useState<Gym[]>(AppStorage.getGyms());

  const refresh = () => {
    setCurrentGym(AppStorage.getCurrentGym());
    setAllGyms(AppStorage.getGyms());
  };

  useEffect(() => {
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, []);

  const switchGym = (gymId: string) => {
    AppStorage.setCurrentGymId(gymId);
    refresh();
  };

  const updateGymSettings = (updates: Partial<Gym>) => {
    const updated = { ...currentGym, ...updates };
    AppStorage.updateGym(updated);
    refresh();
  };

  return (
    <GymContext.Provider
      value={{
        currentGym,
        allGyms,
        switchGym,
        updateGymSettings,
        refresh,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
