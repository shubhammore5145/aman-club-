import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { AppStorage, DATA_CHANGE_EVENT } from '../lib/storage';

interface AuthContextType {
  currentUser: Profile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string) => boolean;
  registerGymOwner: (data: {
    gymName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
  }) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(AppStorage.getCurrentProfile());

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(AppStorage.getCurrentProfile());
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleUpdate);
  }, []);

  const switchRole = (role: UserRole) => {
    const updated = AppStorage.switchRole(role);
    setCurrentUser(updated);
  };

  const login = (email: string): boolean => {
    const profiles = AppStorage.getProfiles();
    const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      AppStorage.setCurrentUserId(found.id);
      if (found.gym_id) {
        AppStorage.setCurrentGymId(found.gym_id);
      }
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const registerGymOwner = (data: {
    gymName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
  }): boolean => {
    const gymId = crypto.randomUUID();
    const ownerId = crypto.randomUUID();

    const newProfile: Profile = {
      id: ownerId,
      email: data.email,
      full_name: data.ownerName,
      role: 'gym_owner',
      phone: data.phone,
      gym_id: gymId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newGym = {
      id: gymId,
      name: data.gymName,
      slug: data.gymName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      owner_id: ownerId,
      address: data.address,
      phone: data.phone,
      email: data.email,
      currency: 'INR',
      currency_symbol: '₹',
      tax_rate: 18,
      opening_hours: 'Mon - Sat: 6:00 AM - 10:00 PM',
      status: 'active' as const,
      subscription_tier: 'pro' as const,
      subscription_cycle: 'monthly' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const gyms = AppStorage.getGyms();
    gyms.push(newGym);
    localStorage.setItem('aman_gym_saas_gyms_v1', JSON.stringify(gyms));

    AppStorage.createProfile(newProfile);
    AppStorage.setCurrentUserId(ownerId);
    AppStorage.setCurrentGymId(gymId);
    setCurrentUser(newProfile);

    return true;
  };

  const logout = () => {
    // Reset to default Aman or unauthenticated
    switchRole('gym_owner');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchRole,
        login,
        registerGymOwner,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
