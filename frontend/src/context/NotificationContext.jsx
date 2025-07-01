import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifs, setNotifs] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifs((prev) => {
      const notif = prev.find(n => n.id === id);
      if (notif?.timeoutId) clearTimeout(notif.timeoutId);
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const addNotification = useCallback((msg) => {
    setNotifs((prev) => {
      // Якщо таке саме повідомлення вже є — нічого не робимо
      if (prev.some(n => n.msg === msg)) return prev;

      const id = Date.now();
      // Запускаємо видалення через 5 с
      const timeoutId = setTimeout(() => removeNotification(id), 5000);

      return [...prev, { id, msg, timeoutId }];
    });
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifs.map(n => (
          <div
            key={n.id}
            className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex justify-between items-center"
          >
            <span>{n.msg}</span>
            <button onClick={() => removeNotification(n.id)} className="ml-4 font-bold">
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
