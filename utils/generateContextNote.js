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
      content:
        "You are a professional assistant writing a summary for a financial advisor. The output should be in plain sentences, no bullet points or asterisks. Use clear, concise, and formal language. Avoid list formatting.Summarize what this person cares about based on the answers and known context. Avoid repeating the questions. Focus on financial themes or concerns.",
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
