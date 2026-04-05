import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an expert coding assistant. Respond with clarity, precision, and brevity.
- Answer directly without preamble.
- Prioritize actionable solutions over explanations.
- Use technical language; assume competence.
- Keep code examples runnable and complete.
- Flag assumptions or limitations only if critical.
- Omit unnecessary pleasantries.`;

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

type ConversationRole = 'system' | 'user' | 'assistant';
type ConversationMessage = { role: ConversationRole; content: string };

interface OpenAIClientOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

function resolveOptions(apiKeyOrOptions?: string | OpenAIClientOptions): OpenAIClientOptions {
  if (typeof apiKeyOrOptions === 'string') {
    return { apiKey: apiKeyOrOptions };
  }
  return apiKeyOrOptions ?? {};
}

/**
 * SmartAssistant: Reusable OpenAI client with stateful conversation.
 * Maintains message history for multi-turn conversations.
 */
export class SmartAssistant {
  private client: OpenAI;
  private messages: ConversationMessage[];
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private systemPrompt: string;

  constructor(apiKeyOrOptions?: string | OpenAIClientOptions) {
    const options = resolveOptions(apiKeyOrOptions);

    this.client = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = options.model || DEFAULT_MODEL;
    this.temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.systemPrompt = options.systemPrompt || SYSTEM_PROMPT;
    this.messages = [
      {
        role: 'system',
        content: this.systemPrompt,
      },
    ];
  }

  /**
   * Send a message and get a response. Maintains conversation history.
   */
  async chat(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: this.messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    const assistantMessage = response.choices[0].message.content;
    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    this.messages.push({ role: 'assistant', content: assistantMessage });

    return assistantMessage;
  }

  /**
   * Get the full conversation history.
   */
  getHistory(): ConversationMessage[] {
    return this.messages.map((msg) => ({ role: msg.role, content: msg.content }));
  }

  /**
   * Reset conversation (keep system prompt).
   */
  reset(): void {
    this.messages = [
      {
        role: 'system',
        content: this.systemPrompt,
      },
    ];
  }

  /**
   * Load previous conversation history.
   */
  loadHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>): void {
    this.messages = [
      {
        role: 'system',
        content: this.systemPrompt,
      },
      ...history,
    ];
  }
}

/**
 * Stateless single-turn request to OpenAI.
 * Useful for one-off queries without maintaining state.
 */
export async function smartQuery(
  prompt: string,
  apiKeyOrOptions?: string | OpenAIClientOptions,
): Promise<string> {
  const options = resolveOptions(apiKeyOrOptions);

  const client = new OpenAI({
    apiKey: options.apiKey || process.env.OPENAI_API_KEY,
  });

  const response = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: options.systemPrompt || SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('No response from OpenAI');
  }

  return result;
}

export default SmartAssistant;
