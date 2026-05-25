import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

export function useLLMOpponent() {
  const [isThinking, setIsThinking] = useState(false);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const addLLMChatMessage = useGameStore((state) => state.addLLMChatMessage);

  const getBestMove = useCallback(async (fen: string, color: 'w' | 'b', moveHistory: string[]): Promise<string | null> => {
    setIsThinking(true);
    setGameStatus({ isAIThinking: true });

    const { llmProvider, llmApiKey, llmModelId } = useSettingsStore.getState();

    if (!llmApiKey) {
      addLLMChatMessage({ role: 'assistant', text: 'Error: No API key provided in settings.' });
      setIsThinking(false);
      setGameStatus({ isAIThinking: false });
      return null;
    }

    const systemPrompt = `You are a chess playing AI opponent. You are playing as ${color === 'w' ? 'White' : 'Black'}. 
Your goal is to choose a valid and strong chess move.
You MUST output your response as a raw JSON object with NO markdown formatting, NO \`\`\`json wrappers, and NO additional text. 
The JSON must have exactly two keys:
- "move": A string representing your chosen move in Standard Algebraic Notation (e.g. "Nf3", "e4", "O-O", "Bxd4"). 
- "chat": A string containing a short, conversational reasoning for your move. Make it engaging, slightly competitive, and no more than 2 sentences.

Current Board FEN: ${fen}
Previous moves in this game: ${moveHistory.length > 0 ? moveHistory.join(', ') : 'None, you are making the first move.'}

Remember: Output ONLY valid JSON. Example: {"move": "e4", "chat": "I'm taking control of the center right away!"}`;

    try {
      let responseText = '';

      if (llmProvider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${llmApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: llmModelId || 'google/gemini-2.5-flash',
            messages: [{ role: 'system', content: systemPrompt }]
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenRouter API error: ${res.status} - ${errText}`);
        }
        const data = await res.json();
        responseText = data.choices[0].message.content;
      } else if (llmProvider === 'gemini') {
        let finalModelId = (llmModelId || 'gemini-1.5-flash').trim();
        if (finalModelId.startsWith('models/')) finalModelId = finalModelId.substring(7);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${finalModelId}:generateContent?key=${llmApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API error: ${res.status} - ${errText}`);
        }
        const data = await res.json();
        responseText = data.candidates[0].content.parts[0].text;
      }

      // Parse JSON from responseText, handling potential markdown wrappers
      let cleanJsonStr = responseText.trim();
      if (cleanJsonStr.startsWith('```json')) {
        cleanJsonStr = cleanJsonStr.substring(7);
        if (cleanJsonStr.endsWith('```')) {
          cleanJsonStr = cleanJsonStr.substring(0, cleanJsonStr.length - 3);
        }
      } else if (cleanJsonStr.startsWith('```')) {
        cleanJsonStr = cleanJsonStr.substring(3);
        if (cleanJsonStr.endsWith('```')) {
          cleanJsonStr = cleanJsonStr.substring(0, cleanJsonStr.length - 3);
        }
      }

      const parsed = JSON.parse(cleanJsonStr.trim());
      if (parsed.move && parsed.chat) {
        addLLMChatMessage({ role: 'assistant', text: parsed.chat });
        setIsThinking(false);
        setGameStatus({ isAIThinking: false });
        return parsed.move;
      } else {
        throw new Error("Invalid JSON structure returned by LLM");
      }

    } catch (error: any) {
      console.error("LLM Error:", error);
      addLLMChatMessage({ role: 'assistant', text: `Oops, I encountered an error: ${error.message}` });
      setIsThinking(false);
      setGameStatus({ isAIThinking: false });
      return null;
    }
  }, [setGameStatus, addLLMChatMessage]);

  return {
    isThinking,
    getBestMove
  };
}
