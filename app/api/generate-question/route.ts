import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined");
}

const ai = new Groq({
  apiKey: GROQ_API_KEY,
});

export async function POST(request: Request) {
  const {
    question_amount = 5,
    title,
    level,
    type,
    company,
    industry,
    description,
    requirements = [],
    responsibilities = [],
    resumeData,
  } = await request.json();

  let prompt;

  if (resumeData) {
    const { skills, experience, projects, achievements } = resumeData;
    const levelInstructions =
      level === 'Beginner'
        ? 'focus on fundamental concepts and basic understanding.'
        : 'ask more in-depth, scenario-based questions that test advanced problem-solving skills.';

    prompt = `
    You are an expert HR interviewer. Your task is to generate thoughtful and relevant interview questions based on a candidate's resume and a specified difficulty level.

    Objective:
    Generate exactly ${question_amount} high-quality questions.

    Candidate's Resume Details:
    - Skills: ${skills?.join(', ')}
    - Experience: ${experience}
    - Projects: ${projects}
    - Achievements: ${achievements}

    Interview Guidelines:
    - Generate a mix of questions: 2-3 from experience, 2-3 from projects, and the rest from skills.
    - For the '${level}' level, ${levelInstructions}
    - Ask for specific examples, outcomes, and lessons learned.
    - Frame questions to assess both technical depth and soft skills.

    Output Format:
    Return only the questions in a valid JSON array of strings, like:
    ["Question 1", "Question 2", "Question 3"]
    `;
  } else {
    prompt = `
    You are an expert HR interviewer and assessment expert. Your task is to generate thoughtful, specific, and relevant interview questions based on a given job description and its structured details.

    Objective:
    Generate exactly ${question_amount} high-quality questions to evaluate a candidate’s readiness and fit for the role.

    Focus Areas:
    - Role Title: ${title}
    - Experience Level: ${level}
    - Employment Type: ${type}
    - Company: ${company}
    - Industry: ${industry}
    - Core Job Description: ${description}

    - Key Requirements:
    ${requirements.map((item: string) => `- ${item}`).join("\n")}

    - Key Responsibilities:
    ${responsibilities.map((item: string) => `- ${item}`).join("\n")}

    Guidelines:
      - Start with basic question, and than rise the bar
      - Use the provided job data to craft questions that assess:
      - Required technical skills and tools (from “requirements”)
      - Practical understanding of the role’s responsibilities
      - Candidate’s experience level and fit
      - Behavioral and situational responses relevant to the role
      - Questions should feel realistic, like those asked in actual interviews for this role.
      - Phrase questions professionally and clearly.
      - Do not include duplicate or generic questions.

    Avoid:
    - Vague or unrelated questions
    - Repetition
    - Hypothetical tech that’s not mentioned in the job description

    Output Format:
    Return only the questions in a valid JSON array of strings, like:
    ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    `;
  }

  try {
    const chatCompletion = await ai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    let questions: string[] = [];
    try {
      const match = text.match(/\`\`\`json([\s\S]*?)\`\`\`|\s*(\[[\s\S]*\])/);
      if (match) {
        const jsonString = match[1] || match[2];
        questions = JSON.parse(jsonString);
      }
    } catch (err) {
      console.error("Error parsing questions from Groq response:", err);
    }

    return Response.json(
      {
        success: true,
        questions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while generating questions", error);
    return Response.json(
      {
        success: false,
        message: "Error while generating questions",
      },
      { status: 500 }
    );
  }
}
