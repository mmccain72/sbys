import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { internal } from "./_generated/api";

// For now we'll use a simplified schema that works with the existing quizResults table
// Later we can add proper chat tables when the schema stabilizes

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// Seasonal type descriptions and characteristics
const SEASONAL_DESCRIPTIONS = {
  Winter: {
    description: "You have a cool undertone with high contrast features. You look stunning in jewel tones, pure colors, and dramatic contrasts.",
    colors: ["navy", "black", "white", "emerald", "sapphire", "ruby", "silver"],
    characteristics: ["High contrast", "Cool undertones", "Bold colors", "Dramatic looks"],
  },
  Summer: {
    description: "You have cool undertones with soft, muted coloring. You shine in soft, cool colors with low to medium contrast.",
    colors: ["powder blue", "lavender", "rose", "sage", "pearl", "dusty pink", "soft gray"],
    characteristics: ["Soft contrast", "Cool undertones", "Muted colors", "Gentle looks"],
  },
  Spring: {
    description: "You have warm undertones with bright, clear coloring. You glow in warm, clear, and bright colors.",
    colors: ["coral", "peach", "golden yellow", "bright green", "turquoise", "warm pink", "ivory"],
    characteristics: ["Clear contrast", "Warm undertones", "Bright colors", "Fresh looks"],
  },
  Autumn: {
    description: "You have warm undertones with rich, muted coloring. You look amazing in warm, rich, and earthy colors.",
    colors: ["rust", "olive", "burgundy", "golden brown", "deep orange", "forest green", "cream"],
    characteristics: ["Rich contrast", "Warm undertones", "Earthy colors", "Sophisticated looks"],
  },
};

// System prompt for the AI color consultant
const SYSTEM_PROMPT = `You are an expert personal color analyst and stylist specializing in seasonal color analysis. Your job is to have a natural, friendly conversation with clients to determine their seasonal color type (Winter, Spring, Summer, or Autumn).

Key guidelines:
1. Ask questions naturally and conversationally, one at a time
2. Focus on: skin undertone, hair color, eye color, jewelry preferences, and color preferences
3. Be encouraging and positive throughout the conversation
4. Extract specific color information from their responses
5. When you have enough information, provide a seasonal analysis with confidence level

Seasonal Types:
- Winter: Cool undertones, high contrast, looks best in jewel tones and pure colors
- Summer: Cool undertones, soft contrast, looks best in muted, soft colors  
- Spring: Warm undertones, clear contrast, looks best in bright, clear colors
- Autumn: Warm undertones, rich contrast, looks best in warm, earthy colors

Start by introducing yourself as their personal color consultant and ask about their natural coloring in a friendly way.`;

export const startColorConsultation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to start consultation");
    }

    // Generate a unique session ID
    const sessionId = `${userId}_${Date.now()}`;
    
    // For now, we'll return a welcome message
    // When schema is stable, we can save to database
    
    return {
      sessionId,
      message: "Hi! I'm your personal color consultant. I'm excited to help you discover your perfect seasonal color palette! Let's start by talking about your natural coloring. What color is your natural hair?",
    };
  },
});

export const sendChatMessage = action({
  args: {
    sessionId: v.string(),
    message: v.string(),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to send messages");
    }

    try {
      // Prepare conversation for OpenAI
      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...args.conversationHistory,
        { role: "user" as const, content: args.message },
      ];

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        functions: [
          {
            name: "analyze_seasonal_type",
            description: "Analyze the user's seasonal color type based on gathered information",
            parameters: {
              type: "object",
              properties: {
                seasonalType: {
                  type: "string",
                  enum: ["Winter", "Spring", "Summer", "Autumn"],
                  description: "The determined seasonal type"
                },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  description: "Confidence level in the analysis (0-1)"
                },
                reasoning: {
                  type: "string",
                  description: "Explanation of why this seasonal type was chosen"
                },
                extractedInfo: {
                  type: "object",
                  properties: {
                    skinTone: { type: "string" },
                    hairColor: { type: "string" },
                    eyeColor: { type: "string" },
                    jewelryPreference: { type: "string" },
                  }
                }
              },
              required: ["seasonalType", "confidence", "reasoning"]
            }
          }
        ],
        function_call: "auto",
      });

      const aiResponse = completion.choices[0];
      
      // Check if AI wants to make an analysis
      if (aiResponse.message.function_call?.name === "analyze_seasonal_type") {
        const analysisData = JSON.parse(aiResponse.message.function_call.arguments);
        
        // Save the analysis result to quizResults table using proper internal API
        await ctx.runMutation(internal.aiColorChat.saveAnalysisResult, {
          sessionId: args.sessionId,
          analysisData,
        });

        const seasonalInfo = SEASONAL_DESCRIPTIONS[analysisData.seasonalType as keyof typeof SEASONAL_DESCRIPTIONS];
        
        return {
          type: "analysis" as const,
          message: `Based on our conversation, I've determined that you are a **${analysisData.seasonalType}**! ${analysisData.reasoning}\n\n${seasonalInfo.description}`,
          analysisData: {
            ...analysisData,
            ...seasonalInfo,
          },
        };
      }

      // Regular conversation response
      return {
        type: "message" as const,
        message: aiResponse.message.content || "I'm sorry, could you repeat that?",
      };

    } catch (error) {
      console.error("OpenAI API error:", error);
      
      // Fallback to rule-based analysis if OpenAI fails
      return {
        type: "message" as const,
        message: "I'm having some technical difficulties. Could you tell me about your skin undertone - would you say it's more cool (pink/blue) or warm (yellow/golden)?",
      };
    }
  },
});

export const saveAnalysisResult = internalMutation({
  args: {
    sessionId: v.string(),
    analysisData: v.object({
      seasonalType: v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn")),
      confidence: v.number(),
      reasoning: v.string(),
      extractedInfo: v.optional(v.object({
        skinTone: v.optional(v.string()),
        hairColor: v.optional(v.string()),
        eyeColor: v.optional(v.string()),
        jewelryPreference: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to save results");
    }

    const seasonalInfo = SEASONAL_DESCRIPTIONS[args.analysisData.seasonalType];

    // Save to the existing quizResults table with AI-generated data
    await ctx.db.insert("quizResults", {
      userId,
      seasonalType: args.analysisData.seasonalType,
      answers: [
        {
          questionId: "ai_analysis",
          answer: JSON.stringify({
            sessionId: args.sessionId,
            confidence: args.analysisData.confidence,
            reasoning: args.analysisData.reasoning,
            extractedInfo: args.analysisData.extractedInfo || {},
          }),
        },
      ],
      description: seasonalInfo.description,
      colors: seasonalInfo.colors,
    });

    return "Analysis saved successfully";
  },
});

export const getChatHistory = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return empty array since we're not storing chat history yet
    // When schema is stable, we can implement proper chat history storage
    return [];
  },
});

// Fallback function for when OpenAI is unavailable
export const fallbackAnalysis = mutation({
  args: {
    responses: v.object({
      skinTone: v.string(),
      hairColor: v.string(),
      eyeColor: v.string(),
      jewelryPreference: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Simple rule-based analysis as fallback
    let winterScore = 0;
    let springScore = 0;
    let summerScore = 0;
    let autumnScore = 0;

    // Analyze skin tone
    if (args.responses.skinTone.toLowerCase().includes("cool") || 
        args.responses.skinTone.toLowerCase().includes("pink")) {
      winterScore += 2;
      summerScore += 2;
    } else if (args.responses.skinTone.toLowerCase().includes("warm") || 
               args.responses.skinTone.toLowerCase().includes("yellow")) {
      springScore += 2;
      autumnScore += 2;
    }

    // Analyze jewelry preference
    if (args.responses.jewelryPreference.toLowerCase().includes("silver")) {
      winterScore += 2;
      summerScore += 2;
    } else if (args.responses.jewelryPreference.toLowerCase().includes("gold")) {
      springScore += 2;
      autumnScore += 2;
    }

    // Determine highest score
    const scores = { Winter: winterScore, Spring: springScore, Summer: summerScore, Autumn: autumnScore };
    const seasonalType = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0] as keyof typeof scores;
    
    const confidence = Math.max(...Object.values(scores)) / 8; // Normalize to 0-1

    const seasonalInfo = SEASONAL_DESCRIPTIONS[seasonalType];

    // Save to quizResults
    await ctx.db.insert("quizResults", {
      userId,
      seasonalType,
      answers: [
        {
          questionId: "fallback_analysis",
          answer: JSON.stringify(args.responses),
        },
      ],
      description: seasonalInfo.description,
      colors: seasonalInfo.colors,
    });

    return {
      seasonalType,
      confidence,
      description: seasonalInfo.description,
      colors: seasonalInfo.colors,
      characteristics: seasonalInfo.characteristics,
    };
  },
});
