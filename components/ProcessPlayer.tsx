
import React, { useState } from 'react';
import type { Process, Answer } from '../types';

interface ProcessPlayerProps {
  process: Process;
  onBack: () => void;
}

const ProcessPlayer: React.FC<ProcessPlayerProps> = ({ process, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswerClick = (answer: Answer) => {
    if (answer.action === 'next') {
      setMessage(null);
      if (currentQuestionIndex < process.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsCompleted(true);
      }
    } else {
      setMessage(answer.message || 'Ação indefinida.');
    }
  };

  const restartProcess = () => {
    setCurrentQuestionIndex(0);
    setMessage(null);
    setIsCompleted(false);
  };

  const currentQuestion = process.questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-gray-medium rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-brand-accent mb-2">{process.name}</h2>
      <p className="text-text-secondary mb-6">Siga as etapas para concluir o processo.</p>
      
      {isCompleted ? (
        <div className="text-center p-8 bg-gray-light rounded-lg">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Processo Concluído com Sucesso!</h3>
          <p className="text-text-primary mb-6">Todos os passos foram verificados.</p>
          <button
            onClick={restartProcess}
            className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-brand-accent transition-colors"
          >
            Reiniciar
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-6 bg-gray-light rounded-lg">
            <p className="text-lg font-semibold text-text-primary">
              <span className="text-brand-accent font-bold mr-2">Passo {currentQuestionIndex + 1}:</span>
              {currentQuestion.text}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            {currentQuestion.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleAnswerClick(answer)}
                className="flex-1 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-transform transform hover:scale-105"
              >
                {answer.text}
              </button>
            ))}
          </div>

          {message && (
            <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-400 text-yellow-300 rounded-lg animate-fade-in-slow" role="alert">
              <p className="font-bold">Instrução:</p>
              <p>{message}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-8 text-sm text-brand-accent hover:underline"
      >
        &larr; Voltar para a seleção de processos
      </button>
    </div>
  );
};

export default ProcessPlayer;
