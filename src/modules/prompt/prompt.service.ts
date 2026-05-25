import { openai } from "../../config/openAi";
import { GPT_TYPE, SYSTEM, USER } from "../../constants/appKeys";
import { PROMPT_FAILED_MSG } from "../../constants/message";

export const generateChatResponse = async (message: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: GPT_TYPE,
      messages: [
        { role: SYSTEM, content: "You are a helpful assistant." },
        { role: USER, content: message },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error(PROMPT_FAILED_MSG);
  }
};
