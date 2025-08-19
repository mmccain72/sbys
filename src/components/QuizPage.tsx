import { AiColorChat } from "./AiColorChat";

interface QuizPageProps {
  setCurrentPage: (page: string) => void;
}

export function QuizPage({ setCurrentPage }: QuizPageProps) {
  return <AiColorChat setCurrentPage={setCurrentPage} />;
}