import React, { useState } from 'react';
import type { Process, Question, Answer } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface ProcessEditorProps {
  process: Process;
  onSave: (updatedProcess: Process) => void;
  onCancel: () => void;
  onDelete: (processId: string) => void;
}

const ProcessEditor: React.FC<ProcessEditorProps> = ({ process, onSave, onCancel, onDelete }) => {
  const [editableProcess, setEditableProcess] = useState<Process>(JSON.parse(JSON.stringify(process)));
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, questionId: string) => {
    setDraggedItemId(questionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', questionId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetId: string) => {
    e.preventDefault();
    const sourceId = draggedItemId;
    if (!sourceId || sourceId === dropTargetId) {
      setDraggedItemId(null);
      return;
    }

    setEditableProcess(currentProcess => {
      const questions = [...currentProcess.questions];
      const sourceIndex = questions.findIndex(q => q.id === sourceId);
      const targetIndex = questions.findIndex(q => q.id === dropTargetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return currentProcess;
      }

      const [draggedItem] = questions.splice(sourceIndex, 1);
      questions.splice(targetIndex, 0, draggedItem);
      return { ...currentProcess, questions };
    });
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };


  const handleProcessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableProcess({ ...editableProcess, name: e.target.value });
  };

  const handleQuestionChange = (questionId: string, text: string) => {
    const updatedQuestions = editableProcess.questions.map(q =>
      q.id === questionId ? { ...q, text } : q
    );
    setEditableProcess({ ...editableProcess, questions: updatedQuestions });
  };

  const handleAnswerChange = (questionId: string, answerId: string, field: keyof Answer, value: string) => {
     const updatedQuestions = editableProcess.questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(a =>
          a.id === answerId ? { ...a, [field]: value } : a
        );
        return { ...q, answers: updatedAnswers };
      }
      return q;
    });
    setEditableProcess({ ...editableProcess, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: 'Nova pergunta?',
      answers: [
        { id: crypto.randomUUID(), text: 'Sim', action: 'next' },
        { id: crypto.randomUUID(), text: 'Não', action: 'message', message: 'Instrução para "Não".' }
      ]
    };
    setEditableProcess({ ...editableProcess, questions: [...editableProcess.questions, newQuestion] });
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = editableProcess.questions.filter(q => q.id !== questionId);
    setEditableProcess({ ...editableProcess, questions: updatedQuestions });
  };

  const addAnswer = (questionId: string) => {
    const newAnswer: Answer = {
      id: crypto.randomUUID(),
      text: 'Nova Opção',
      action: 'message',
      message: 'Instrução para nova opção.'
    };
    const updatedQuestions = editableProcess.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, answers: [...q.answers, newAnswer] };
      }
      return q;
    });
    setEditableProcess({ ...editableProcess, questions: updatedQuestions });
  };

  const deleteAnswer = (questionId: string, answerId: string) => {
     const updatedQuestions = editableProcess.questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.filter(a => a.id !== answerId);
        return { ...q, answers: updatedAnswers };
      }
      return q;
    });
    setEditableProcess({ ...editableProcess, questions: updatedQuestions });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-gray-medium rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-brand-accent mb-6">Editor de Processo</h2>

      <div className="mb-6">
        <label htmlFor="processName" className="block text-sm font-medium text-text-secondary mb-1">Nome do Processo</label>
        <input
          id="processName"
          type="text"
          value={editableProcess.name}
          onChange={handleProcessNameChange}
          className="w-full bg-gray-light border border-gray-light rounded-md p-2 text-text-primary focus:ring-brand-accent focus:border-brand-accent"
        />
      </div>

      <div>
        {editableProcess.questions.map((question, index) => (
          <div 
            key={question.id}
            draggable
            onDragStart={(e) => handleDragStart(e, question.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, question.id)}
            onDragEnd={handleDragEnd}
            className={`mb-6 p-4 border rounded-lg transition-all ${draggedItemId ? 'cursor-grabbing' : 'cursor-default'} ${draggedItemId === question.id ? 'opacity-40 border-brand-accent border-dashed' : 'border-gray-light bg-gray-medium'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3 text-text-primary">
                  <DragHandleIcon />
                  <h3 className="text-lg font-semibold">Pergunta {index + 1}</h3>
              </div>
              <button onClick={() => deleteQuestion(question.id)} className="text-red-400 hover:text-red-600">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={question.text}
              onChange={(e) => handleQuestionChange(question.id, e.target.value)}
              className="w-full bg-gray-light border border-gray-light rounded-md p-2 text-text-primary focus:ring-brand-accent focus:border-brand-accent"
              rows={2}
            />
            
            <div className="mt-4 pl-4 border-l-2 border-brand-primary">
              <h4 className="text-md font-semibold text-text-secondary mb-2">Respostas</h4>
              {question.answers.map(answer => (
                <div key={answer.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 p-2 bg-gray-light/50 rounded">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Texto da Resposta</label>
                    <input type="text" value={answer.text} onChange={e => handleAnswerChange(question.id, answer.id, 'text', e.target.value)} className="w-full text-sm bg-gray-dark border border-gray-light rounded p-1.5"/>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Ação</label>
                    <select value={answer.action} onChange={e => handleAnswerChange(question.id, answer.id, 'action', e.target.value)} className="w-full text-sm bg-gray-dark border border-gray-light rounded p-1.5">
                      <option value="next">Próxima Pergunta</option>
                      <option value="message">Mostrar Mensagem</option>
                    </select>
                  </div>
                   <div className="flex items-end">
                    {answer.action === 'message' && (
                       <div className="flex-grow">
                        <label className="block text-xs text-text-secondary mb-1">Mensagem</label>
                        <input type="text" value={answer.message || ''} onChange={e => handleAnswerChange(question.id, answer.id, 'message', e.target.value)}  className="w-full text-sm bg-gray-dark border border-gray-light rounded p-1.5"/>
                      </div>
                    )}
                    <button onClick={() => deleteAnswer(question.id, answer.id)} className="ml-2 p-1.5 text-red-400 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                   </div>
                </div>
              ))}
               <button onClick={() => addAnswer(question.id)} className="mt-2 flex items-center gap-1 text-sm text-brand-accent hover:text-brand-light">
                <PlusIcon className="w-4 h-4"/> Adicionar Resposta
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-light rounded-lg text-text-secondary hover:bg-gray-light hover:text-text-primary transition-colors">
        <PlusIcon className="w-5 h-5" /> Adicionar Pergunta
      </button>

      <div className="flex justify-between mt-8">
        <button onClick={() => onDelete(editableProcess.id)} className="px-6 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          Excluir Processo
        </button>
        <div>
          <button onClick={onCancel} className="px-6 py-2 text-text-secondary font-semibold rounded-lg hover:bg-gray-light mr-4">
            Cancelar
          </button>
          <button onClick={() => onSave(editableProcess)} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessEditor;