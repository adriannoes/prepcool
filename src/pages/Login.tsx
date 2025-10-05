
import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white p-6">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Entrar na PrepCool
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Acesse sua conta para continuar seus estudos
        </p>
        
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              id="email"
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent" 
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input 
              id="password"
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent" 
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <button 
              type="submit" 
              className="w-full bg-coral hover:bg-coral/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Ainda não tem uma conta?{" "}
            <a href="#" className="text-coral hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
