
export interface Answer {
  id: string;
  text: string;
  action: 'next' | 'message';
  message?: string;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Process {
  id: string;
  name: string;
  questions: Question[];
}
