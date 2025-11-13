import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import type { Process } from './types';
import ProcessPlayer from './components/ProcessPlayer';
import ProcessEditor from './components/ProcessEditor';
import PlusIcon from './components/icons/PlusIcon';
import LoginModal from './components/LoginModal';
import UserIcon from './components/icons/UserIcon';
import LogoutIcon from './components/icons/LogoutIcon';

function App() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'player' | 'editor'>('player');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const loadProcesses = async () => {
      setIsLoading(true);
      const fetchedProcesses = await api.getProcesses();
      setProcesses(fetchedProcesses);
      setIsLoading(false);
    };
    
    loadProcesses();

    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleSelectProcess = (process: Process) => {
    setSelectedProcess(process);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setMode('editor');
  };

  const handleSaveProcess = async (updatedProcess: Process) => {
    const updatedList = processes.map(p => p.id === updatedProcess.id ? updatedProcess : p);
    const sortedList = [...updatedList].sort((a, b) => a.name.localeCompare(b.name));
    setProcesses(sortedList);
    await api.saveProcesses(updatedList);
    setEditingProcess(null);
    setMode('player');
  };
  
  const handleCreateNewProcess = async () => {
    const newProcess: Process = {
      id: crypto.randomUUID(),
      name: 'Novo Processo Sem Título',
      questions: []
    };
    const updatedList = [...processes, newProcess];
    const sortedList = [...updatedList].sort((a, b) => a.name.localeCompare(b.name));
    setProcesses(sortedList);
    await api.saveProcesses(updatedList);
    setEditingProcess(newProcess);
    setMode('editor');
  };
  
  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
        const updatedList = processes.filter(p => p.id !== processId);
        setProcesses(updatedList);
        await api.saveProcesses(updatedList);
        setEditingProcess(null);
        setMode('player');
    }
  };

  const handleLogin = (password: string): boolean => {
    if (password === 'admin') { 
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setMode('player');
    setEditingProcess(null);
    setSelectedProcess(null);
  };


  const renderPlayerHome = () => {
    const filteredProcesses = processes.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="w-full max-w-3xl mx-auto mt-8 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Selecione um Processo</h2>
          <p className="text-text-secondary mb-8">Escolha um dos guias abaixo para iniciar.</p>
          
          <div className="mb-8 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Buscar processo pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-light border-2 border-gray-light rounded-full p-3 px-5 text-text-primary focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              aria-label="Buscar processo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProcesses.map(p => (
                  <div key={p.id} className="bg-gray-medium p-4 rounded-lg flex justify-between items-center text-left">
                      <span className="font-semibold text-text-primary">{p.name}</span>
                      <div className="flex items-center">
                          <button onClick={() => handleSelectProcess(p)} className="px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors whitespace-nowrap">
                              Iniciar
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleEditProcess(p)} className="px-3 py-2 bg-gray-light text-text-secondary font-semibold rounded-lg hover:bg-gray-medium/50 transition-colors ml-2">
                               Editar
                            </button>
                          )}
                      </div>
                  </div>
              ))}

              {filteredProcesses.length === 0 && searchTerm && (
                <div className="md:col-span-2 text-center py-8">
                  <p className="text-text-secondary">Nenhum processo encontrado com o termo "{searchTerm}".</p>
                </div>
              )}

              {isAdmin && (
                <button onClick={handleCreateNewProcess} className="border-2 border-dashed border-gray-light rounded-lg p-4 flex flex-col items-center justify-center text-text-secondary hover:bg-gray-light hover:text-text-primary transition-colors">
                    <PlusIcon className="w-8 h-8 mb-2" />
                    <span className="font-semibold">Criar Novo Processo</span>
                </button>
              )}
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-dark font-sans p-4">
       {isLoginModalOpen && (
        <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />
      )}
      <header className="max-w-6xl mx-auto flex justify-between items-center py-4 border-b border-gray-light">
        <h1 className="text-xl md:text-2xl font-bold text-brand-accent">Guia de Processos Institucionais</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-gray-medium p-1 rounded-full">
                <button
                    onClick={() => { setMode('player'); setSelectedProcess(null); setEditingProcess(null);}}
                    className={`px-4 py-1.5 text-sm rounded-full transition-colors ${mode === 'player' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-gray-light'}`}
                >
                    Modo de Uso
                </button>
                {isAdmin && (
                    <button
                        onClick={() => { setMode('editor'); setSelectedProcess(null); if (!editingProcess && processes.length > 0) {setEditingProcess(processes[0])}}}
                        className={`px-4 py-1.5 text-sm rounded-full transition-colors ${mode === 'editor' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-gray-light'}`}
                    >
                        Modo de Edição
                    </button>
                )}
            </div>
            {isAdmin ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors">
                <LogoutIcon className="w-5 h-5" />
                <span>Sair</span>
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors">
                <UserIcon className="w-5 h-5" />
                <span>Acesso Admin</span>
              </button>
            )}
        </div>
      </header>
      
      <main>
        {isLoading ? (
            <div className="text-center mt-16 text-text-secondary">
              <p>Carregando processos...</p>
            </div>
        ) : (
          <>
            {mode === 'player' && (
              selectedProcess ? (
                <ProcessPlayer process={selectedProcess} onBack={() => setSelectedProcess(null)} />
              ) : (
                renderPlayerHome()
              )
            )}
            
            {mode === 'editor' && (
              editingProcess && isAdmin ? (
                <ProcessEditor 
                    process={editingProcess} 
                    onSave={handleSaveProcess} 
                    onCancel={() => {setEditingProcess(null); setMode('player');}}
                    onDelete={handleDeleteProcess}
                />
              ) : (
                <div className="text-center mt-16">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Acesso Restrito</h2>
                    <p className="text-text-secondary mb-6">Você precisa ser um administrador para acessar o modo de edição.</p>
                    <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors">
                        Fazer Login
                    </button>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;