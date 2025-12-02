import React, { useState } from 'react';
import { User, Role } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import UserIcon from './icons/UserIcon';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreateUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  currentUserId: string;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onCreateUser,
  onDeleteUser,
  currentUserId
}) => {
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as Role
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    if (users.some(u => u.username === newUser.username)) {
      setError('Nome de usuário já existe');
      return;
    }
    
    onCreateUser(newUser);
    setNewUser({ username: '', password: '', name: '', role: 'user' });
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
             <UserIcon className="w-6 h-6" />
             Gerenciar Usuários
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Create User Form */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Adicionar Novo Usuário</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  placeholder="Login"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  placeholder="Senha"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  placeholder="Nome Completo"
                />
              </div>
              <div className="md:col-span-1">
                 <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                 <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                    className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                 >
                     <option value="user">Usuário</option>
                     <option value="admin">Admin</option>
                 </select>
              </div>
              <div className="md:col-span-1">
                <button type="submit" className="w-full flex justify-center items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                  <PlusIcon className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.id !== currentUserId ? (
                         <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                           <TrashIcon className="w-5 h-5" />
                         </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Atual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;