import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { Process } from './types';
import ProcessPlayer from './components/ProcessPlayer';
import ProcessEditor from './components/ProcessEditor';
import LoginModal from './components/LoginModal';
import UserIcon from './components/icons/UserIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import EditorHome from './components/EditorHome';

const initialProcesses: Process[] = [
  {
    id: "1",
    name: "Mudança de Turno",
    questions: [
      {
        id: "q1",
        text: "O aluno já abriu o requerimento no portal do aluno?",
        answers: [
          { id: "a11", text: "Sim", action: "next" },
          { id: "a12", text: "Não", action: "message", message: "Para iniciar o processo de mudança de turno, o aluno deverá abrir o requerimento no Portal do Aluno." }
        ]
      },
      {
        id: "q2",
        text: "O aluno realizou o pagamento da taxa no valor de R$80,00?",
        answers: [
          { id: "a21", text: "Sim", action: "next" },
          { id: "a22", text: "Não", action: "message", message: "O aluno precisa pagar uma taxa de R$80,00 para que o processo aberto comece a tramitar." }
        ]
      },
      {
        id: "q3",
        text: "A solicitação está dentro do prazo do calendário acadêmico?",
        answers: [
          { id: "a31", text: "Sim", action: "next" },
          { id: "a32", text: "Não", action: "message", message: "O processo não pode ser continuado fora do prazo estipulado no calendário acadêmico." }
        ]
      }
    ]
  }
];

function App() {
  const [processes, setProcesses] = useLocalStorage<Process[]>('processes', initialProcesses);
  const [mode, setMode] = useState<'player' | 'editor'>('player');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    setProcesses(currentProcesses =>
      [...currentProcesses].sort((a, b) => a.name.localeCompare(b.name))
    );
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
