import { createContext, useContext, useState, useEffect } from 'react';

const TroopContext = createContext();

export function TroopProvider({ children }) {
  const [activeTroop, setActiveTroop] = useState('714');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log('=== TroopContext Initializing ===');
    
    // Get user from localStorage
    const userStr = localStorage.getItem('currentUser');
    console.log('currentUser from localStorage:', userStr);
    
    if (!userStr) {
      console.log('No user found in localStorage');
      setCurrentUser(null);
      setActiveTroop('714');
      return;
    }

    const user = JSON.parse(userStr);
    console.log('Parsed user:', user);
    setCurrentUser(user);
    
    const isAdmin = user.userType === 'admin';
    console.log('Is Admin?', isAdmin);
    
    if (isAdmin) {
      // Admin: Load saved troop preference or default to 714
      const savedTroop = localStorage.getItem('activeTroop') || '714';
      console.log('Admin - using savedTroop:', savedTroop);
      setActiveTroop(savedTroop);
      localStorage.setItem('activeTroop', savedTroop);
    } else {
      // Regular leader: ALWAYS use their assigned troop
      const userTroop = user.troop || '714';
      console.log('Leader - using user.troop:', userTroop);
      setActiveTroop(userTroop);
      localStorage.setItem('activeTroop', userTroop);
    }
    
    console.log('Final activeTroop:', localStorage.getItem('activeTroop'));
    console.log('=================================');
  }, []);

  const switchTroop = (troop) => {
    console.log('=== switchTroop called ===');
    console.log('currentUser:', currentUser);
    console.log('isAdmin:', currentUser?.userType === 'admin');
    console.log('Requested troop:', troop);
    
    // Only admin can switch troops
    if (currentUser?.userType === 'admin') {
      console.log('Admin confirmed - switching troop');
      setActiveTroop(troop);
      localStorage.setItem('activeTroop', troop);
      console.log('Troop switched to:', troop);
      console.log('localStorage activeTroop:', localStorage.getItem('activeTroop'));
      console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
      
      // Verify user didn't change
      const userCheck = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('User after switch:', userCheck.email, userCheck.userType);
      
      // CRITICAL: Make sure we don't update currentUser state
      // Only update activeTroop
    } else {
      console.warn('Non-admin tried to switch troops!');
      console.log('Current user type:', currentUser?.userType);
    }
    console.log('=======================');
  };

  const isAdmin = currentUser?.userType === 'admin';

  return (
    <TroopContext.Provider value={{ activeTroop, switchTroop, currentUser, isAdmin }}>
      {children}
    </TroopContext.Provider>
  );
}

export function useTroop() {
  const context = useContext(TroopContext);
  if (!context) {
    throw new Error('useTroop must be used within TroopProvider');
  }
  return context;
}