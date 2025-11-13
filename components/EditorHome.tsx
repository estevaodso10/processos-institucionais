import React from 'react';
import type { Process } from '../types';
import PlusIcon from './icons/PlusIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import TrashIcon from './icons/TrashIcon';

interface EditorHomeProps {
  processes: Process[];
  onEdit: (process: Process) => void;
  onDelete: (processId: string) => void;
  onCreate: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const EditorHome: React.FC<EditorHomeProps> = ({
  processes,
  onEdit,
  onDelete,
  onCreate,
  onImport,
  onExport,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-gray-medium rounded-lg shadow-xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-accent">Modo de Edição</h2>
          <p className="text-text-secondary mt-1">Gerencie, crie, importe ou exporte os processos.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <input type="file" accept=".json" ref={fileInputRef} onChange={onImport} className="hidden" />
          <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-gray-light text-text-secondary font-semibold rounded-lg hover:bg-gray-light/50 transition-colors">
            <UploadIcon className="w-5 h-5" />
            <span>Importar JSON</span>
          </button>
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-gray-light text-text-secondary font-semibold rounded-lg hover:bg-gray-light/50 transition-colors">
            <DownloadIcon className="w-5 h-5" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {processes.map(p => (
          <div key={p.id} className="bg-gray-light p-3 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-text-primary">{p.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(p)} className="px-4 py-1.5 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-brand-accent transition-colors">
                Editar
              </button>
              <button onClick={() => onDelete(p.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {processes.length === 0 && (
            <div className="text-center py-8">
                <p className="text-text-secondary">Nenhum processo cadastrado. Comece criando um novo.</p>
            </div>
        )}
      </div>

      <button onClick={onCreate} className="w-full mt-6 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-light rounded-lg text-text-secondary hover:bg-gray-light hover:text-text-primary transition-colors">
        <PlusIcon className="w-5 h-5" /> Criar Novo Processo
      </button>

      <div className="mt-8 p-4 bg-gray-light/50 border border-brand-primary/20 rounded-lg">
          <h4 className="font-bold text-brand-light">Como salvar as alterações para todos?</h4>
          <p className="text-sm text-text-secondary mt-1">
              As edições são salvas localmente no seu navegador. Para que todos os usuários vejam as atualizações, você deve:
              <br /> 1. Clicar em <strong>"Exportar JSON"</strong> para baixar o arquivo de configuração atual.
              <br /> 2. Enviar este arquivo para o desenvolvedor responsável.
              <br /> 3. O desenvolvedor irá substituir o arquivo <strong>processos.json</strong> na aplicação e publicá-la novamente.
          </p>
      </div>

    </div>
  );
};

export default EditorHome;
