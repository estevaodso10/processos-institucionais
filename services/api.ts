import type { Process } from '../types';

const STORAGE_KEY = 'processes';

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

// Simula a latência da rede
const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getProcesses = async (): Promise<Process[]> => {
  await apiDelay(500); // Simula o carregamento de dados
  try {
    const storedData = window.localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const processes: Process[] = JSON.parse(storedData);
      return processes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Se não houver nada no armazenamento, inicializa com os dados padrão
      const sortedInitial = initialProcesses.sort((a, b) => a.name.localeCompare(b.name));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedInitial));
      return sortedInitial;
    }
  } catch (error) {
    console.error("Falha ao buscar processos:", error);
    return initialProcesses.sort((a, b) => a.name.localeCompare(b.name));
  }
};

export const saveProcesses = async (processes: Process[]): Promise<void> => {
  await apiDelay(300); // Simula o salvamento de dados
  try {
    const sortedProcesses = [...processes].sort((a, b) => a.name.localeCompare(b.name));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedProcesses));
  } catch (error) {
    console.error("Falha ao salvar processos:", error);
    // Em um aplicativo real, você pode querer lançar o erro
  }
};
