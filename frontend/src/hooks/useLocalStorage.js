import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch custom event for cross-tab synchronization
        window.dispatchEvent(
          new CustomEvent('localStorage', {
            detail: { key, newValue: valueToStore }
          })
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        window.dispatchEvent(
          new CustomEvent('localStorage', {
            detail: { key, newValue: null }
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue);
      }
    };

    const handleNativeStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('localStorage', handleStorageChange);
      window.addEventListener('storage', handleNativeStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('localStorage', handleStorageChange);
        window.removeEventListener('storage', handleNativeStorageChange);
      }
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;