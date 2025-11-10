import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (password: string) => boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(password);
    if (!success) {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-dark bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-slow"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div 
        className="bg-gray-medium p-8 rounded-lg shadow-2xl w-full max-w-sm relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl font-bold text-text-secondary hover:text-white"
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <h2 id="login-title" className="text-2xl font-bold text-center text-brand-accent mb-6">Acesso Administrativo</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-light border-2 border-gray-light rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-secondary text-white font-bold py-3 rounded-lg hover:bg-brand-accent transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
