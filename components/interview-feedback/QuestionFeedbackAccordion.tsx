import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QuestionFeedback } from "@/types/feedback";
import Markdown from "react-markdown";
import { AlertCircle, Lightbulb, MessageSquare, Target } from "lucide-react";

interface QuestionFeedbackAccordionProps {
  questions: QuestionFeedback[];
  scoreColor: (score: number) => string;
}

const QuestionFeedbackAccordion: React.FC<QuestionFeedbackAccordionProps> = ({
  questions,
  scoreColor,
}) => {
  return (
    <Card className="mb-6 overflow-hidden shadow-md border-slate-700 tracking-wider">
      <CardHeader className="bg-blue-50 border-b border-slate-200 p-6">
        <CardTitle className="text-xl font-bold text-blue-900">
          Question Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Accordion type="single" collapsible className="space-y-4">
          {questions.map((question, index) => (
            <AccordionItem
              key={index}
              value={`question-${question.question_id}`}
              className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors hover:no-underline">
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-700" />
                      <span className="font-extrabold text-blue-900">
                        Question {question.question_id}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold mb-3">
                      {question.question}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs text-white font-semibold shadow-sm ${scoreColor(
                      question.evaluation.score
                    )}`}
                  >
                    {question.evaluation.score} / 10
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-white">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Your Answer:
                      </h4>
                      <p className="text-gray-700 italic">
                        {question.candidate_answer
                          ? `"${question.candidate_answer}"`
                          : `"I didn't answer this question."`}
                      </p>
                    </div>
                    <div className="bg-pink-950/10 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Ideal Answer Approach:
                      </h4>
                      <p className="text-gray-700 mb-3">
                        {question.actual_answer}
                      </p>

                      <h5 className="font-semibold text-gray-900 mb-2">
                        Key Points to Cover:
                      </h5>
                      <ul className="space-y-1">
                        {question.expected_ideal_points.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Coverage & Depth:
                      </h4>
                      <div>
                        <div className="text-sm text-gray-700 mb-2 ">
                          <Markdown>{question.evaluation.coverage}</Markdown>
                        </div>
                        <div className="text-sm text-gray-600">
                          <Markdown>{question.evaluation.depth}</Markdown>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                        Missed Points:
                      </h4>
                      {question.evaluation.missed_points.length > 0 ? (
                        <ul className="space-y-1">
                          {question.evaluation.missed_points.map(
                            (point, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700">
                                  {point}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-700">
                          No major points missed!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Recommendation:
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {question.recommendation}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default QuestionFeedbackAccordion;
