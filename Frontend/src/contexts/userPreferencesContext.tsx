import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface UserPreferencesContextType {
  image: string;
  changeBackground: (image: string) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<string>(() => {
    const stored = localStorage.getItem('chat_background');
    return stored || 'image_2.jpg';
  });

  const changeBackground = (newImage: string) => {
    setImage(newImage);
    localStorage.setItem('chat_background', newImage);
  };

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chat_background' && e.newValue) {
        setImage(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <UserPreferencesContext.Provider value={{ image, changeBackground }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return context;
}