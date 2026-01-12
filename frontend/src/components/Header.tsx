// src/components/Header.tsx

import React from 'react';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onToggleAdmin }) => {
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
        </div>
      </div>
    </header>
  );
};

export default Header;