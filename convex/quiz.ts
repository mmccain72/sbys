import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Quiz questions for seasonal color analysis
const QUIZ_QUESTIONS = [
  {
    id: "skin_undertone",
    question: "What undertone does your skin have?",
    options: [
      { value: "cool_pink", label: "Cool with pink undertones", points: { Winter: 3, Summer: 2, Spring: 0, Autumn: 0 } },
      { value: "cool_blue", label: "Cool with blue undertones", points: { Winter: 2, Summer: 3, Spring: 0, Autumn: 0 } },
      { value: "warm_yellow", label: "Warm with yellow undertones", points: { Winter: 0, Summer: 0, Spring: 3, Autumn: 2 } },
      { value: "warm_golden", label: "Warm with golden undertones", points: { Winter: 0, Summer: 0, Spring: 2, Autumn: 3 } },
    ],
  },
  {
    id: "eye_color",
    question: "What color are your eyes?",
    options: [
      { value: "dark_brown", label: "Dark brown or black", points: { Winter: 3, Summer: 1, Spring: 0, Autumn: 2 } },
      { value: "light_brown", label: "Light brown or hazel", points: { Winter: 1, Summer: 2, Spring: 2, Autumn: 3 } },
      { value: "blue", label: "Blue", points: { Winter: 2, Summer: 3, Spring: 1, Autumn: 0 } },
      { value: "green", label: "Green", points: { Winter: 1, Summer: 2, Spring: 3, Autumn: 2 } },
    ],
  },
  {
    id: "hair_color",
    question: "What is your natural hair color?",
    options: [
      { value: "black", label: "Black", points: { Winter: 3, Summer: 0, Spring: 0, Autumn: 1 } },
      { value: "dark_brown", label: "Dark brown", points: { Winter: 2, Summer: 1, Spring: 0, Autumn: 2 } },
      { value: "light_brown", label: "Light brown", points: { Winter: 0, Summer: 2, Spring: 1, Autumn: 3 } },
      { value: "blonde", label: "Blonde", points: { Winter: 0, Summer: 3, Spring: 3, Autumn: 1 } },
      { value: "red", label: "Red or auburn", points: { Winter: 0, Summer: 1, Spring: 2, Autumn: 3 } },
    ],
  },
  {
    id: "jewelry_preference",
    question: "Which jewelry looks better on you?",
    options: [
      { value: "silver", label: "Silver and platinum", points: { Winter: 3, Summer: 3, Spring: 0, Autumn: 0 } },
      { value: "gold", label: "Gold and copper", points: { Winter: 0, Summer: 0, Spring: 3, Autumn: 3 } },
    ],
  },
  {
    id: "color_intensity",
    question: "Which colors make you look most vibrant?",
    options: [
      { value: "bright_bold", label: "Bright, bold colors", points: { Winter: 3, Summer: 0, Spring: 2, Autumn: 1 } },
      { value: "soft_muted", label: "Soft, muted colors", points: { Winter: 0, Summer: 3, Spring: 1, Autumn: 2 } },
      { value: "warm_earthy", label: "Warm, earthy colors", points: { Winter: 0, Summer: 1, Spring: 2, Autumn: 3 } },
      { value: "clear_bright", label: "Clear, bright colors", points: { Winter: 2, Summer: 1, Spring: 3, Autumn: 0 } },
    ],
  },
];

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

export const getQuizQuestions = query({
  args: {},
  handler: async () => {
    return QUIZ_QUESTIONS;
  },
});

export const submitQuizResponse = mutation({
  args: {
    responses: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to submit quiz");
    }

    // Calculate seasonal type based on responses
    const scores = { Winter: 0, Summer: 0, Spring: 0, Autumn: 0 };
    
    for (const response of args.responses) {
      const question = QUIZ_QUESTIONS.find(q => q.id === response.questionId);
      if (question) {
        const option = question.options.find(o => o.value === response.answer);
        if (option) {
          Object.entries(option.points).forEach(([season, points]) => {
            scores[season as keyof typeof scores] += points;
          });
        }
      }
    }

    // Find the highest scoring season
    const seasonalType = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof scores;

    const maxScore = Math.max(...Object.values(scores));
    const confidence = maxScore / (QUIZ_QUESTIONS.length * 3); // Normalize to 0-1

    const result = {
      seasonalType,
      confidence,
      description: SEASONAL_DESCRIPTIONS[seasonalType].description,
    };

    // Save quiz result to the quizResults table
    await ctx.db.insert("quizResults", {
      userId,
      seasonalType,
      answers: args.responses.map(r => ({ questionId: r.questionId, answer: r.answer })),
      description: SEASONAL_DESCRIPTIONS[seasonalType].description,
      colors: SEASONAL_DESCRIPTIONS[seasonalType].colors,
    });

    // Auto-join user to their seasonal group
    try {
      // Find the group for this seasonal type
      const group = await ctx.db
        .query("groups")
        .withIndex("by_seasonal_type", (q) => q.eq("seasonalType", seasonalType))
        .first();
      
      if (group) {
        // Check if already a member
        const existingMembership = await ctx.db
          .query("groupMemberships")
          .withIndex("by_user_and_group", (q) => 
            q.eq("userId", userId).eq("groupId", group._id)
          )
          .first();
        
        if (!existingMembership) {
          // Create new membership
          await ctx.db.insert("groupMemberships", {
            userId,
            groupId: group._id,
            joinedAt: Date.now(),
            memberType: "member",
            isActive: true,
            lastActivityAt: Date.now(),
          });
          
          // Update group member count
          await ctx.db.patch(group._id, {
            memberCount: group.memberCount + 1,
          });
          
          // Log activity
          await ctx.db.insert("groupActivities", {
            groupId: group._id,
            userId,
            activityType: "joined",
            createdAt: Date.now(),
          });
        }
      }
    } catch (error) {
      // Don't fail quiz submission if group join fails
      console.error("Failed to auto-join group:", error);
    }

    return {
      seasonalType,
      confidence,
      description: SEASONAL_DESCRIPTIONS[seasonalType].description,
      colors: SEASONAL_DESCRIPTIONS[seasonalType].colors,
      characteristics: SEASONAL_DESCRIPTIONS[seasonalType].characteristics,
    };
  },
});

export const getUserSeasonalType = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const result = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!result) {
      return null;
    }

    return {
      seasonalType: result.seasonalType,
      description: result.description,
      colors: result.colors,
      characteristics: SEASONAL_DESCRIPTIONS[result.seasonalType].characteristics,
    };
  },
});

export const getSeasonalTypeInfo = query({
  args: {
    seasonalType: v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn")),
  },
  handler: async (ctx, args) => {
    return SEASONAL_DESCRIPTIONS[args.seasonalType];
  },
});

export const resetQuizResults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to reset quiz results");
    }

    // Delete all quiz results for this user
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const result of results) {
      await ctx.db.delete(result._id);
    }

    return "Quiz results reset successfully";
  },
});
