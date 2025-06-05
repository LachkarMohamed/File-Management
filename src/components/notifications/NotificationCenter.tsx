import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, UploadCloud, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type NotificationType = 'upload' | 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<Notification, 'id' | 'timestamp'>>;
      setNotifications(prev => [
        ...prev,
        {
          ...customEvent.detail,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now()
        }
      ]);
    };

    const handleUpdateProgress = (e: Event) => {
      const { id, progress } = (e as CustomEvent<{ id: string; progress: number }>).detail;
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, progress } : n)
      );
    };

    window.addEventListener('notify', handleNotification as EventListener);
    window.addEventListener('updateProgress', handleUpdateProgress as EventListener);
    
    return () => {
      window.removeEventListener('notify', handleNotification as EventListener);
      window.removeEventListener('updateProgress', handleUpdateProgress as EventListener);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(n => 
          n.type === 'upload' || 
          now - n.timestamp < (n.type === 'error' ? 5000 : 3000)
        )
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'upload': return <UploadCloud className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'upload': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] w-80 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg border shadow-lg ${getBgColor(notification.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <button 
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {notification.message && (
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                )}
                
                {notification.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Uploading...</span>
                      <span>{notification.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${notification.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};