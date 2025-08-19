import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { AiColorChat } from "./AiColorChat";

interface QuizPageProps {
  setCurrentPage: (page: string) => void;
}

export function QuizPageWithAI({ setCurrentPage }: QuizPageProps) {
  const [useAiChat, setUseAiChat] = useState(true);
  const [isRetaking, setIsRetaking] = useState(false);
  
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const resetQuizResults = useMutation(api.quiz.resetQuizResults);

  const handleRetakeQuiz = async () => {
    try {
      setIsRetaking(true);
      await resetQuizResults();
      setUseAiChat(true);
      toast.success("Quiz reset! You can now retake it.");
    } catch (error) {
      toast.error("Failed to reset quiz");
    } finally {
      setIsRetaking(false);
    }
  };

  // If user already has a result, show it
  if (userSeasonalType && !isRetaking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Seasonal Type</h2>
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xl font-semibold">
              {userSeasonalType.seasonalType}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{userSeasonalType.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Perfect Colors</h3>
              <div className="flex flex-wrap gap-3">
                {userSeasonalType.colors.map((color) => (
                  <span
                    key={color}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleRetakeQuiz}
              disabled={isRetaking}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetaking ? "Resetting..." : "Retake Quiz"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show AI Chat for new users
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Color Consultation
          </h2>
          <p className="text-gray-600">
            Chat with our AI to discover your perfect seasonal colors
          </p>
        </div>
        <AiColorChat setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}