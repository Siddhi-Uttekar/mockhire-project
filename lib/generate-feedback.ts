import { client } from "@/lib/openai.sdk";
import { InterviewFeedbackResult, LLMResponse } from "@/types/feedback";
import { Job } from "@/types/feedback";

interface Transcript {
  role: string;
  content: string;
}

// Constants for timeouts and retries
const LLM_TIMEOUT_MS = 60000; // 60 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

class InterviewFeedbackGenerator {
  private jobDetails: Job;
  private transcript: String;
  private questions: string[];
  private userName: string;

  constructor(
    jobDetails: Job,
    transcript: String,
    questions: string[],
    userName: string,
  ) {
    this.jobDetails = jobDetails || {};
    this.transcript = transcript || "";
    this.questions = Array.isArray(questions) ? questions : [];
    this.userName = userName || "Candidate";
  }

  private safeGetJobField(
    field: keyof Job,
    defaultValue: string = "N/A",
  ): string {
    const value = this.jobDetails?.[field];
    if (value === undefined || value === null) return defaultValue;
    if (Array.isArray(value)) return value.join(", ") || defaultValue;
    return String(value) || defaultValue;
  }

  private safeGetArrayField(field: keyof Job): string[] {
    const value = this.jobDetails?.[field];
    if (Array.isArray(value)) return value;
    return [];
  }

  async generateInterviewSummary() {
    const requirements = this.safeGetArrayField("requirements" as keyof Job);
    const prompt = `
    As a senior interview coach, analyze this candidate's overall performance:

    Job Data:
    Position: ${this.safeGetJobField("title")} at ${this.safeGetJobField("company" as keyof Job, "the company")}
    Employment Type: ${this.safeGetJobField("type")}
    Experience Level: ${this.safeGetJobField("level")}
    Industry: ${this.safeGetJobField("industry" as keyof Job)}
    Role Description: ${this.safeGetJobField("description")}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${requirements.map((item) => `- ${item}`).join("\n") || "Not specified"}

    Focus on:
    - Overall impression and themes
    - Observable strengths across all answers
    - Areas needing improvement
    - Overall rating (0-10)

    Analyze their overall performance, noting:
    - How they came across as a candidate
    - Consistent themes and patterns
    - Observable strengths across answers
    - Areas where coaching would help
    - Overall readiness for this specific role

    Interview transcript or conversation:
    ${this.transcript}

    Return only JSON:
    {
      "overall_analysis": "string",
      "notable_strengths": ["array of strings"],
      "areas_for_improvement": ["array of strings"],
      "overall_rating": "float (0.0 to 10.0)"
    }`;

    return await this.callLLMWithFallback(prompt, {
      overall_analysis: "Unable to generate analysis at this time.",
      notable_strengths: ["Interview completed"],
      areas_for_improvement: [
        "Review interview recording for detailed feedback",
      ],
      overall_rating: 5.0,
    });
  }

  async generateScorecard() {
    const requirements = this.safeGetArrayField("requirements" as keyof Job);
    const responsibilities = this.safeGetArrayField(
      "responsibilities" as keyof Job,
    );

    const prompt = `
   As a senior interview coach, evaluate this candidate's or user performance across key dimensions for this job post:
    Position: ${this.safeGetJobField("title")} at ${this.safeGetJobField("company" as keyof Job, "the company")}
    Employment Type: ${this.safeGetJobField("type")}
    Experience Level: ${this.safeGetJobField("level")}
    Industry: ${this.safeGetJobField("industry" as keyof Job)}
    Role Description: ${this.safeGetJobField("description")}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${requirements.map((item: string) => `- ${item}`).join("\n") || "Not specified"}

    MAIN RESPONSIBILITIES:
    ${responsibilities.map((item: string) => `- ${item}`).join("\n") || "Not specified"}

    Transcript:
    ${this.transcript}

    Score each area 0-10 with detailed specific commentary and give the responsse as you are directly helping or talking to user or candidate:

    Return only JSON:
    {
      "technical_skills": {"score": number, "commentary": "string"},
      "problem_solving": {"score": number, "commentary": "string"},
      "communication": {"score": number, "commentary": "string"},
      "confidence": {"score": number, "commentary": "string"}
    }`;

    return await this.callLLMWithFallback(prompt, {
      technical_skills: {
        score: 5,
        commentary: "Unable to fully evaluate technical skills.",
      },
      problem_solving: {
        score: 5,
        commentary: "Unable to fully evaluate problem solving.",
      },
      communication: {
        score: 5,
        commentary: "Unable to fully evaluate communication.",
      },
      confidence: {
        score: 5,
        commentary: "Unable to fully evaluate confidence.",
      },
    });
  }

  async generateQuestionFeedback() {
    const questionFeedback = [];

    if (!this.questions || this.questions.length === 0) {
      console.log("No questions provided for feedback generation");
      return [];
    }

    console.log(
      `Starting question-by-question feedback generation for ${this.questions.length} questions`,
    );

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      if (!question || typeof question !== "string") {
        console.warn(`Skipping invalid question at index ${i}`);
        continue;
      }

      console.log(
        `Processing question ${i + 1}/${
          this.questions.length
        }: ${question.substring(0, 60)}...`,
      );

      let candidateAnswer: string;
      try {
        candidateAnswer = await this.extractAnswerForQuestion(question, i);
        console.log(
          `Extracted answer length: ${candidateAnswer.length} characters`,
        );
      } catch (extractError) {
        console.error(
          `Failed to extract answer for question ${i + 1}:`,
          extractError,
        );
        candidateAnswer = "Unable to extract answer from transcript.";
      }

      const sanitizedQuestion = this.sanitizeForJSON(question);
      const sanitizedAnswer = this.sanitizeForJSON(candidateAnswer);
      const requirements = this.safeGetArrayField("requirements" as keyof Job);

      const prompt = `
As an interview coach, evaluate this single Q&A for this job post:

Position: ${this.safeGetJobField("title")} at ${this.safeGetJobField("company" as keyof Job, "the company")}
Employment Type: ${this.safeGetJobField("type")}
Experience Level: ${this.safeGetJobField("level")}
Industry: ${this.safeGetJobField("industry" as keyof Job)}
Role Description: ${this.safeGetJobField("description")}

Candidate's Name: ${this.userName}

Question: ${question}

Candidate Answer: ${candidateAnswer}

Job Requirements:
${requirements.map((item: string) => `- ${item}`).join("\n") || "Not specified"}

Your task is to provide detailed feedback:
1. Provide an ideal answer for this specific question and role
2. Identify key points a strong candidate should mention
3. Evaluate how well their answer matched expectations
4. Note specific missed opportunities
5. Assess depth and insight demonstrated
6. Give personal coaching recommendation

Return ONLY this JSON object:
{
  "question_id": ${i + 1},
  "question": "${sanitizedQuestion}",
  "candidate_answer": "${sanitizedAnswer}",
  "actual_answer": "ideal response for this role",
  "expected_ideal_points": ["key point 1", "key point 2", "key point 3"],
  "evaluation": {
    "score": 7,
    "coverage": "coverage analysis",
    "missed_points": ["missed point 1", "missed point 2"],
    "depth": "depth evaluation"
  },
  "recommendation": "coaching suggestion"
}`;

      try {
        const feedback = await this.callLLMWithFallback(prompt, {
          question_id: i + 1,
          question: question,
          candidate_answer: candidateAnswer,
          actual_answer: "Unable to generate ideal answer at this time.",
          expected_ideal_points: ["Review question requirements"],
          evaluation: {
            score: 5,
            coverage: "Unable to evaluate",
            missed_points: [],
            depth: "Unable to evaluate",
          },
          recommendation:
            "Please review your answer and consider additional details.",
        });

        const finalFeedback = Array.isArray(feedback) ? feedback[0] : feedback;

        if (finalFeedback && finalFeedback.question) {
          // Ensure the question and answer are preserved
          finalFeedback.question = question;
          finalFeedback.candidate_answer = candidateAnswer;
          questionFeedback.push(finalFeedback);
          console.log(`✓ Question ${i + 1} feedback generated successfully`);
        } else {
          console.warn(`⚠ Question ${i + 1} feedback invalid, using fallback`);
          questionFeedback.push({
            question_id: i + 1,
            question: question,
            candidate_answer: candidateAnswer,
            actual_answer: "Unable to generate ideal answer",
            expected_ideal_points: ["Unable to generate"],
            evaluation: {
              score: 5,
              coverage: "Unable to evaluate",
              missed_points: [],
              depth: "Unable to evaluate",
            },
            recommendation: "Please review the full interview transcript",
          });
        }
      } catch (error) {
        console.error(
          `Error generating feedback for question ${i + 1}:`,
          error,
        );
        questionFeedback.push({
          question_id: i + 1,
          question: question,
          candidate_answer: candidateAnswer,
          actual_answer: "Error generating feedback",
          expected_ideal_points: ["Error"],
          evaluation: {
            score: 5,
            coverage: "Error during evaluation",
            missed_points: [],
            depth: "Error",
          },
          recommendation: "Please try again later",
        });
      }
    }

    console.log(
      `✓ Completed all ${questionFeedback.length} question feedbacks`,
    );
    return questionFeedback;
  }

  async generateFinalRecommendations() {
    const requirements = this.safeGetArrayField("requirements" as keyof Job);
    const responsibilities = this.safeGetArrayField(
      "responsibilities" as keyof Job,
    );

    const prompt = `
    As a senior interview coach, provide final recommendations based on this candidate's interview performance:

    JOB: ${this.safeGetJobField("title")} at ${this.safeGetJobField("company" as keyof Job, "the company")}
    INDUSTRY: ${this.safeGetJobField("industry" as keyof Job)}
    LEVEL: ${this.safeGetJobField("level")}
    Role Description: ${this.safeGetJobField("description")}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${requirements.map((item: string) => `- ${item}`).join("\n") || "Not specified"}

    MAIN RESPONSIBILITIES:
    ${responsibilities.map((item: string) => `- ${item}`).join("\n") || "Not specified"}

    INTERVIEW TRANSCRIPT OR CONVERSATION:
    ${this.transcript}

    Based on what you observed, provide:
    1. Specific practice areas they should focus on before their real interview
    2. Your honest assessment of their readiness for this role
    3. One actionable tip that would make the biggest difference

    Be encouraging but honest - like a mentor who truly wants them to succeed.

    Return ONLY this JSON structure:
    {
      "practice_focus_areas": ["Specific practice area 1", "Specific practice area 2", "Specific practice area 3"],
      "overall_impression": "Your honest take on whether they seem ready for this role and what's missing if not",
      "final_tip": "One encouraging but actionable takeaway that would make a real difference"
    }`;

    return await this.callLLMWithFallback(prompt, {
      practice_focus_areas: [
        "Technical fundamentals",
        "Communication clarity",
        "Problem-solving approach",
      ],
      overall_impression:
        "The interview was completed. Review the detailed feedback for specific insights.",
      final_tip:
        "Keep practicing and focus on clearly articulating your thought process.",
    });
  }

  async generateCompleteFeedback(): Promise<InterviewFeedbackResult> {
    try {
      // Run all generations in parallel for efficiency
      const [summary, scorecard, questionFeedback, recommendations] =
        await Promise.all([
          this.generateInterviewSummary().catch((err) => {
            console.error("Error generating interview summary:", err);
            return {
              overall_analysis: "Unable to generate analysis.",
              notable_strengths: ["Interview completed"],
              areas_for_improvement: ["Review recording for details"],
              overall_rating: 5.0,
            };
          }),
          this.generateScorecard().catch((err) => {
            console.error("Error generating scorecard:", err);
            return {
              technical_skills: { score: 5, commentary: "Unable to evaluate." },
              problem_solving: { score: 5, commentary: "Unable to evaluate." },
              communication: { score: 5, commentary: "Unable to evaluate." },
              confidence: { score: 5, commentary: "Unable to evaluate." },
            };
          }),
          this.generateQuestionFeedback().catch((err) => {
            console.error("Error generating question feedback:", err);
            return [];
          }),
          this.generateFinalRecommendations().catch((err) => {
            console.error("Error generating final recommendations:", err);
            return {
              practice_focus_areas: ["Continue practicing"],
              overall_impression: "Unable to generate impression.",
              final_tip: "Keep practicing.",
            };
          }),
        ]);

      const completeFeedback = {
        interview_summary: summary,
        scorecard: scorecard,
        per_question_feedback: questionFeedback,
        final_recommendations: recommendations,
      };

      return completeFeedback;
    } catch (error) {
      console.error("Error generating complete feedback:", error);
      // Return a minimal valid feedback structure
      return {
        interview_summary: {
          overall_analysis: "Error occurred during feedback generation.",
          notable_strengths: ["Interview was attempted"],
          areas_for_improvement: ["Unable to process feedback at this time"],
          overall_rating: 5.0,
        },
        scorecard: {
          technical_skills: { score: 5, commentary: "Unable to evaluate." },
          problem_solving: { score: 5, commentary: "Unable to evaluate." },
          communication: { score: 5, commentary: "Unable to evaluate." },
          confidence: { score: 5, commentary: "Unable to evaluate." },
        },
        per_question_feedback: [],
        final_recommendations: {
          practice_focus_areas: ["Try again later"],
          overall_impression: "An error occurred during feedback generation.",
          final_tip: "Please try submitting again.",
        },
      };
    }
  }

  async extractAnswerForQuestion(
    question: string,
    index: number,
  ): Promise<string> {
    try {
      if (!this.transcript || this.transcript.length === 0) {
        return "No transcript available.";
      }

      const transcriptLines = this.transcript
        .split("\n")
        .filter((line) => line.trim());

      let candidateResponse = "";
      let foundQuestion = false;

      // Try to find the answer in the transcript using substring matching
      const questionPrefix = question
        .toLowerCase()
        .substring(0, Math.min(30, question.length));

      for (let i = 0; i < transcriptLines.length; i++) {
        const line = transcriptLines[i];

        if (line.toLowerCase().includes(questionPrefix)) {
          foundQuestion = true;
          continue;
        }

        if (
          foundQuestion &&
          (line.includes("- user:") || line.includes("- assistant:"))
        ) {
          if (line.includes("- user:")) {
            candidateResponse = line.replace(/- user:/i, "").trim();

            for (let j = i + 1; j < transcriptLines.length; j++) {
              const nextLine = transcriptLines[j];
              if (nextLine.includes("- assistant:")) {
                break;
              }
              if (nextLine.includes("- user:")) {
                candidateResponse +=
                  " " + nextLine.replace(/- user:/i, "").trim();
                continue;
              }
              candidateResponse += " " + nextLine.trim();
            }
            break;
          }
        }
      }

      if (!candidateResponse || candidateResponse.length < 5) {
        console.log(`Using AI extraction for question ${index + 1}`);

        const prompt = `
You are an expert assistant analyzing interview transcripts.

Interview Transcript:
${this.transcript}

Question Asked:
"${question}"

Extract ONLY the candidate's complete answer to this specific question. Return the exact words spoken by the candidate (user role).

Return JSON format:
{
  "exact_answer": "the candidate's complete answer here"
}

If no answer is found, return:
{
  "exact_answer": "No answer was provided by the candidate for this question."
}
`;

        const response: LLMResponse = await this.callLLMWithFallback(prompt, {
          exact_answer:
            "No answer was provided by the candidate for this question.",
        });
        candidateResponse = response?.exact_answer || "No answer recorded";
      }

      return candidateResponse || "No answer recorded";
    } catch (error) {
      console.error(
        `Error extracting answer for question ${index + 1}:`,
        error,
      );
      return "Error extracting answer";
    }
  }

  private sanitizeForJSON(str: string): string {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  async callLLMWithFallback(prompt: string, fallback: any): Promise<any> {
    try {
      return await this.callLLM(prompt);
    } catch (error) {
      console.error("LLM call failed, using fallback:", error);
      return fallback;
    }
  }

  async callLLM(prompt: string): Promise<any> {
    let text = "";
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

        try {
          const chatCompletion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: process.env.AZURE_OPENAI_MODEL_NAME || "",
            temperature: 0.7,
            max_tokens: 4096,
          });

          clearTimeout(timeoutId);
          text = chatCompletion.choices[0]?.message?.content || "";
        } catch (apiError) {
          clearTimeout(timeoutId);
          throw apiError;
        }

        // Remove markdown code blocks if present
        text = text
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();

        // Fix truncated JSON by ensuring it ends properly
        if (text && !text.endsWith("}") && !text.endsWith("]")) {
          console.warn("JSON appears truncated, attempting to repair...");
          text = this.repairTruncatedJSON(text);
        }

        // Sanitize the JSON string to handle control characters within string values
        text = this.sanitizeJSONString(text);

        const parsedFeedback = JSON.parse(text || "{}");
        return parsedFeedback;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `LLM call attempt ${attempt}/${MAX_RETRIES} failed:`,
          error,
        );

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS * attempt),
          );
        }
      }
    }

    console.error("All LLM attempts failed");
    console.error("Failed to parse text:", text?.substring(0, 500));
    throw lastError || new Error("LLM call failed after all retries");
  }

  private repairTruncatedJSON(text: string): string {
    // Count opening and closing braces
    const openBraces = (text.match(/{/g) || []).length;
    const closeBraces = (text.match(/}/g) || []).length;

    // Find the last complete string value
    let lastQuote = text.lastIndexOf('"');

    if (lastQuote === -1) {
      // No quotes found, just try to close braces
      for (let i = 0; i < openBraces - closeBraces; i++) {
        text += "}";
      }
      return text;
    }

    // Check if we're in the middle of a string (odd number of quotes after last complete property)
    const textUpToLastQuote = text.substring(0, lastQuote + 1);
    const quoteCount = (textUpToLastQuote.match(/"/g) || []).length;

    if (quoteCount % 2 === 0) {
      // Even quotes means string is complete, just add closing braces
      text = textUpToLastQuote;
    } else {
      // Odd quotes means we're in the middle of a string, close it
      const secondLastQuote = text.lastIndexOf('"', lastQuote - 1);
      if (secondLastQuote >= 0) {
        text = text.substring(0, secondLastQuote + 1);
      }
    }

    // Recalculate and add necessary closing braces
    const newOpenBraces = (text.match(/{/g) || []).length;
    const newCloseBraces = (text.match(/}/g) || []).length;
    const bracesToAdd = newOpenBraces - newCloseBraces;

    for (let i = 0; i < bracesToAdd; i++) {
      text += "}";
    }

    return text;
  }

  private sanitizeJSONString(text: string): string {
    if (!text) return "{}";

    // This regex-based approach preserves JSON structure while cleaning string content
    return text.replace(/"([^"\\]|\\.)*"/g, (match) => {
      // Inside a JSON string, escape unescaped control characters
      return match.replace(/[\x00-\x1F]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code === 0x09) return "\\t"; // tab
        if (code === 0x0a) return "\\n"; // newline
        if (code === 0x0d) return "\\r"; // carriage return
        if (code === 0x08) return "\\b"; // backspace
        if (code === 0x0c) return "\\f"; // form feed
        return ""; // Remove other control characters
      });
    });
  }
}

export default InterviewFeedbackGenerator;
