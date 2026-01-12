// src/components/AuthHeader.tsx

import React from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../types/auth';

interface AuthHeaderProps {
  user: User;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onLogout: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ user, isAdmin, onToggleAdmin, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="transform transition-transform hover:scale-105">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Tool Discovery
            </h1>
            <p className="text-sm text-gray-600">Find the perfect AI tools for your needs</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            {user.role === 'admin' && (
              <button
                onClick={onToggleAdmin}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isAdmin 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                {isAdmin ? 'Admin Mode' : 'User Mode'}
              </button>
            )}
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;