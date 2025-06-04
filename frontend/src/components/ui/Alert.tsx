import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ variant, title, message, onClose }) => {
  const variantClasses = {
    success: 'bg-green-50 border-green-400 text-green-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className={`rounded-lg border p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm">{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;