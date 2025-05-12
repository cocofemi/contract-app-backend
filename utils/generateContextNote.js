// const { OpenAI } = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function generateContextNote({ answers, contactSnapshot }) {
//   const messages = [];

//   messages.push({
//     role: "system",
//     content:
//       "You are an assistant that helps financial advisors understand what matters most to their clients.",
//   });

//   const plainAnswers = answers.join("\n");

//   messages.push({
//     role: "user",
//     content: `Here is what the person answered on the scheduling form:\n\n${plainAnswers}`,
//   });

//   if (contactSnapshot?.properties) {
//     const notes = Object.entries(contactSnapshot.properties)
//       .map(([key, val]) => `${key}: ${val}`)
//       .join("\n");

//     messages.push({
//       role: "user",
//       content: `Here is what we know from HubSpot:\n\n${notes}`,
//     });
//   }

//   const completion = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages,
//     temperature: 0.7,
//   });

//   return completion.choices[0].message.content;
// }

// module.exports = { generateContextNote };

const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateContextNote({ answers, contactSnapshot }) {
  const userAnswers = answers.join("\n");

  const messages = [
    {
      role: "system",
      content: `
       You are an intelligent assistant summarizing a person's recent input. Use clear, professional sentences. Do not use bullet points, headings, or lists. Your goal is to extract what this person cares about based on their answers, and if relevant, connect their statements to known context.

If any context is related, briefly mention it in the summary as a natural extension of their answer. Do not repeat the question that was asked. Be concise, insightful, and write in a natural tone.

Avoid generic summaries — focus on personal insights or themes that emerge.

Do not use phrases like "The user said" or "In response to the question."
       `,
    },
    {
      role: "user",
      content: `Answers from the person:\n\n${userAnswers}`,
    },
  ];

  if (contactSnapshot) {
    const contextData = Object.entries(contactSnapshot)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");

    messages.push({
      role: "user",
      content: `Known context:\n\n${contextData}`,
    });
  }

  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192", // or "mixtral-8x7b-32768"
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error(
      "Groq summarization failed:",
      err?.response?.data || err.message
    );
    return null;
  }
}

module.exports = { generateContextNote };
