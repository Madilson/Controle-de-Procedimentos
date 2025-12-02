import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  companyLogo?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, companyLogo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-primary-600 p-8 text-center">
           {companyLogo ? (
              <div className="mx-auto mb-4 flex justify-center">
                 <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="max-h-24 max-w-[80%] object-contain bg-white/10 rounded-lg p-2 backdrop-blur-sm" 
                 />
              </div>
           ) : (
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                 <UserIcon className="w-8 h-8 text-white" />
              </div>
           )}
           <h2 className="text-2xl font-bold text-white">Bem-vindo</h2>
           <p className="text-primary-100 mt-1">Faça login para acessar o sistema</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuário</label>
              <input
                type="text"
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            
            <div className="text-center text-xs text-gray-400">
                <p>Credenciais Padrão:</p>
                <p>Admin: admin / 123</p>
                <p>Usuário: user / 123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;