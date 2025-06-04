import React, { useState } from 'react';
import { FolderArchive, Mail, Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { authApi, LoginCredentials } from '../api/auth';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(credentials);
      login(response.token);
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <FolderArchive className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">EPGDocs</h1>
          <p className="mt-2 text-gray-600">Sign in to access your documents</p>
        </div>

        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              required
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              value={credentials.username}
              onChange={handleChange}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              required
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end">
            <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;