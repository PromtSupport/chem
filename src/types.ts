export interface User {
  role: 'student' | 'teacher' | null;
  name: string;
  school?: string;
  studentClass?: string;
}

export interface Question {
  id: string | number;
  q: string;
  a: string;
  options: string[];
}

export interface Topic {
  id: string;
  className: string;
  topicName: string;
  questions: Question[];
}

export interface ReferenceItem {
  id: string;
  name: string;
  formula: string;
  description: string;
  imageUrl?: string;
}

export interface StudentResultDetails {
  q: string;
  correct: boolean;
  studentAnswer: string;
  correctAnswer: string;
}

export interface StudentResult {
  id: string;
  studentName: string;
  school?: string;
  studentClass?: string;
  topicName: string;
  score: number;
  total: number;
  details: StudentResultDetails[];
  date: string;
}

export interface AppState {
  catalog: Topic[];
  referenceData: ReferenceItem[];
  studentResults: StudentResult[];
}
