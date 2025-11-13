import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { Process } from './types';
import ProcessPlayer from './components/ProcessPlayer';
import ProcessEditor from './components/ProcessEditor';
import LoginModal from './components/LoginModal';
import UserIcon from './components/icons/UserIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import EditorHome from './components/EditorHome';

function App() {
  const [processes, setProcesses] = useLocalStorage<Process[]>('processes', []);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'player' | 'editor'>('player');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }

    const initializeProcesses = async () => {
      const storedProcessesRaw = localStorage.getItem('processes');
      // Only fetch if local storage is empty or contains an empty array
      if (storedProcessesRaw && JSON.parse(storedProcessesRaw).length > 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/processos.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Process[] = await response.json();
        setProcesses(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to fetch processes:", error);
        alert("Não foi possível carregar os processos. Por favor, tente recarregar a página.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeProcesses();
  }, [setProcesses]);

  const handleSelectProcess = (process: Process) => {
    setSelectedProcess(process);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setMode('editor');
  };

  const handleSaveProcess = (updatedProcess: Process) => {
    setProcesses(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p).sort((a, b) => a.name.localeCompare(b.name)));
    setEditingProcess(null);
  };
  
  const handleCreateNewProcess = () => {
    const newProcess: Process = {
      id: crypto.randomUUID(),
      name: 'Novo Processo Sem Título',
      questions: []
    };
    setProcesses(prev => [...prev, newProcess]);
    setEditingProcess(newProcess);
    setMode('editor');
  };
  
  const handleDeleteProcess = (processId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
        setProcesses(prev => prev.filter(p => p.id !== processId));
        setEditingProcess(null);
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

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(processes, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'processos.json';
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Isso substituirá todos os processos atuais. Deseja continuar?')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("O conteúdo do arquivo não é texto.");
            const importedProcesses: Process[] = JSON.parse(text);
            
            if (Array.isArray(importedProcesses) && importedProcesses.every(p => p.id && p.name && p.questions)) {
                setProcesses(importedProcesses.sort((a, b) => a.name.localeCompare(b.name)));
                alert('Processos importados com sucesso!');
            } else {
                throw new Error('Formato do arquivo JSON inválido.');
            }
        } catch (error) {
            console.error('Erro ao importar processos:', error);
            alert(`Falha ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`);
        } finally {
             event.target.value = '';
        }
    };
    reader.readAsText(file);
  };

  const filteredProcesses = processes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-dark flex items-center justify-center">
            <p className="text-text-primary text-xl animate-pulse">Carregando processos...</p>
        </div>
    );
  }

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
                        onClick={() => { setMode('editor'); setSelectedProcess(null); setEditingProcess(null); }}
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
        {mode === 'player' && (
          selectedProcess ? (
            <ProcessPlayer process={selectedProcess} onBack={() => setSelectedProcess(null)} />
          ) : (
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
                            <button onClick={() => handleSelectProcess(p)} className="px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors whitespace-nowrap">
                                Iniciar
                            </button>
                        </div>
                    ))}

                    {filteredProcesses.length === 0 && (
                      <div className="md:col-span-2 text-center py-8">
                        <p className="text-text-secondary">
                          {searchTerm ? `Nenhum processo encontrado com o termo "${searchTerm}".` : 'Nenhum processo disponível.'}
                        </p>
                      </div>
                    )}
                </div>
            </div>
          )
        )}
        
        {mode === 'editor' && isAdmin && (
           editingProcess ? (
             <ProcessEditor 
                process={editingProcess} 
                onSave={handleSaveProcess} 
                onCancel={() => setEditingProcess(null)}
                onDelete={handleDeleteProcess}
             />
           ) : (
             <EditorHome 
              processes={processes}
              onEdit={handleEditProcess}
              onDelete={handleDeleteProcess}
              onCreate={handleCreateNewProcess}
              onImport={handleImport}
              onExport={handleExport}
            />
           )
        )}
        
        {mode === 'editor' && !isAdmin && (
            <div className="text-center mt-16">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Acesso Restrito</h2>
                <p className="text-text-secondary mb-6">Você precisa ser um administrador para acessar o modo de edição.</p>
                <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors">
                    Fazer Login
                </button>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
