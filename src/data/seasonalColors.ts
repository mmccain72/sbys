// Comprehensive Seasonal Color Database
// 144 colors organized by season for style education

export interface ColorInfo {
  name: string;
  hex: string;
  category: 'neutral' | 'accent' | 'statement' | 'metal';
}

export interface SeasonData {
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  shoppingTips: string[];
  avoidColors: string[];
  bestMetals: string[];
  makeupTips: string[];
  fabricRecommendations: string[];
  colors: ColorInfo[];
}

export const seasonalColorData: Record<string, SeasonData> = {
  Winter: {
    name: "Winter",
    emoji: "🌨️",
    description: "Cool, dramatic palette with bold, high-contrast jewel tones",
    characteristics: [
      "Cool undertones",
      "High contrast",
      "Jewel tones",
      "Pure, saturated colors",
      "Dramatic and bold"
    ],
    shoppingTips: [
      "Look for pure, saturated colors without any brown or gold undertones",
      "Choose stark whites over creams",
      "Opt for true black instead of brown or navy for basics",
      "Select jewel-toned statement pieces",
      "Pick silver or white gold jewelry over gold"
    ],
    avoidColors: [
      "Warm browns", "Orange-based reds", "Yellow-greens", "Peachy tones", "Warm beiges"
    ],
    bestMetals: ["Silver", "Platinum", "White Gold", "Rose Gold (cool-toned)"],
    makeupTips: [
      "Cool-toned foundations with pink undertones",
      "True red or berry lipsticks",
      "Silver or cool-toned eyeshadows",
      "Black or dark brown mascara"
    ],
    fabricRecommendations: [
      "Crisp cotton", "Silk", "Satin", "Leather", "Patent leather", "Metallic fabrics"
    ],
    colors: [
      { name: "Acid Yellow", hex: "#DFFF00", category: "accent" },
      { name: "Black", hex: "#000000", category: "neutral" },
      { name: "Burgundy", hex: "#800020", category: "statement" },
      { name: "Carmine", hex: "#960018", category: "statement" },
      { name: "Cerise", hex: "#DE3163", category: "accent" },
      { name: "Charcoal", hex: "#36454F", category: "neutral" },
      { name: "Dark Emerald", hex: "#046307", category: "statement" },
      { name: "Damson", hex: "#4B0038", category: "statement" },
      { name: "Electric Blue", hex: "#7DF9FF", category: "accent" },
      { name: "Fuchsia", hex: "#FF00FF", category: "statement" },
      { name: "Grey", hex: "#808080", category: "neutral" },
      { name: "Ice Aqua", hex: "#B0E0E6", category: "accent" },
      { name: "Ice Blue", hex: "#D6ECEF", category: "accent" },
      { name: "Ice Green", hex: "#CAE4DB", category: "accent" },
      { name: "Ice Hyacinth", hex: "#D4D4F7", category: "accent" },
      { name: "Ice Lavender", hex: "#E6E6FA", category: "accent" },
      { name: "Ice Lemon", hex: "#FFF44F", category: "accent" },
      { name: "Ice Pink", hex: "#FFE4E1", category: "accent" },
      { name: "Indigo", hex: "#4B0082", category: "statement" },
      { name: "Lagoon Blue", hex: "#004D61", category: "statement" },
      { name: "Light Emerald", hex: "#50C878", category: "accent" },
      { name: "Light Grey", hex: "#D3D3D3", category: "neutral" },
      { name: "Lobelia", hex: "#3B83BD", category: "accent" },
      { name: "Magenta", hex: "#FF00FF", category: "statement" },
      { name: "Mole", hex: "#796D62", category: "neutral" },
      { name: "Navy", hex: "#000080", category: "neutral" },
      { name: "Pine Green", hex: "#01796F", category: "statement" },
      { name: "Raspberry", hex: "#E30B5C", category: "accent" },
      { name: "Royal Blue", hex: "#4169E1", category: "statement" },
      { name: "Royal Purple", hex: "#7851A9", category: "statement" },
      { name: "Scarlet", hex: "#FF2400", category: "statement" },
      { name: "Shocking Pink", hex: "#FC0FC0", category: "statement" },
      { name: "Silver", hex: "#C0C0C0", category: "metal" },
      { name: "Stone", hex: "#ADA587", category: "neutral" },
      { name: "Turquoise Blue", hex: "#40E0D0", category: "accent" },
      { name: "White", hex: "#FFFFFF", category: "neutral" }
    ]
  },
  Spring: {
    name: "Spring",
    emoji: "🌸",
    description: "Warm, fresh palette with clear, vibrant colors",
    characteristics: [
      "Warm undertones",
      "Clear and bright",
      "Yellow-based colors",
      "Fresh and vibrant",
      "Light to medium intensity"
    ],
    shoppingTips: [
      "Look for warm, clear colors with yellow undertones",
      "Choose ivory or cream over pure white",
      "Select camel or warm browns over black for neutrals",
      "Pick coral and peach tones for blush colors",
      "Choose gold jewelry over silver"
    ],
    avoidColors: [
      "Cool grays", "Black", "Burgundy", "Dark purple", "Icy pastels"
    ],
    bestMetals: ["Gold", "Copper", "Bronze", "Rose Gold (warm-toned)"],
    makeupTips: [
      "Warm-toned foundations with yellow/peach undertones",
      "Coral or peach lipsticks",
      "Golden or warm-toned eyeshadows",
      "Brown mascara for daytime"
    ],
    fabricRecommendations: [
      "Light cotton", "Linen", "Light wool", "Crepe", "Jersey", "Suede"
    ],
    colors: [
      { name: "Apple Green", hex: "#8DB600", category: "accent" },
      { name: "Aqua", hex: "#00FFFF", category: "accent" },
      { name: "Aquamarine", hex: "#7FFFD4", category: "accent" },
      { name: "Banana", hex: "#FCF4A3", category: "accent" },
      { name: "Beige", hex: "#F5F5DC", category: "neutral" },
      { name: "Bright Blue", hex: "#0096FF", category: "statement" },
      { name: "Bright Navy", hex: "#003366", category: "neutral" },
      { name: "Canary Yellow", hex: "#FFEF00", category: "statement" },
      { name: "Chocolate", hex: "#7B3F00", category: "neutral" },
      { name: "Cinnamon", hex: "#D2691E", category: "accent" },
      { name: "Coral", hex: "#FF7F50", category: "accent" },
      { name: "Corn Yellow", hex: "#FFF380", category: "accent" },
      { name: "Cream", hex: "#FFFDD0", category: "neutral" },
      { name: "Dove Grey", hex: "#999999", category: "neutral" },
      { name: "Flamingo Pink", hex: "#FC8EAC", category: "accent" },
      { name: "Geranium", hex: "#E63946", category: "statement" },
      { name: "Geranium Pink", hex: "#FF69B4", category: "accent" },
      { name: "Honey", hex: "#FFB300", category: "accent" },
      { name: "Hyacinth", hex: "#7A4988", category: "accent" },
      { name: "Kerry Green", hex: "#4CBB17", category: "statement" },
      { name: "Leaf Green", hex: "#74C365", category: "accent" },
      { name: "Light Dove Grey", hex: "#CCCCCC", category: "neutral" },
      { name: "Light Peach", hex: "#FFD8B1", category: "accent" },
      { name: "Mint Green", hex: "#98FF98", category: "accent" },
      { name: "Oatmeal", hex: "#D4C4A0", category: "neutral" },
      { name: "Oxford Blue", hex: "#002147", category: "neutral" },
      { name: "Peach", hex: "#FFE5B4", category: "accent" },
      { name: "Poppy", hex: "#E35335", category: "statement" },
      { name: "Salmon", hex: "#FA8072", category: "accent" },
      { name: "Shell Pink", hex: "#FFB6C1", category: "accent" },
      { name: "Shocking Pink", hex: "#FC0FC0", category: "statement" },
      { name: "Tan", hex: "#D2B48C", category: "neutral" },
      { name: "Tangerine", hex: "#F28500", category: "accent" },
      { name: "Terracotta", hex: "#CC4E5C", category: "accent" },
      { name: "Turquoise", hex: "#30D5C8", category: "accent" },
      { name: "Violet", hex: "#EE82EE", category: "accent" }
    ]
  },
  Summer: {
    name: "Summer",
    emoji: "☀️",
    description: "Cool palette with soft, muted tones",
    characteristics: [
      "Cool undertones",
      "Soft and muted",
      "Blue-based colors",
      "Gentle and subtle",
      "Low to medium contrast"
    ],
    shoppingTips: [
      "Look for soft, muted colors with blue or pink undertones",
      "Choose soft white or off-white over stark white",
      "Select soft navy or charcoal over black",
      "Pick powder or dusty shades",
      "Choose silver or rose gold jewelry"
    ],
    avoidColors: [
      "Bright orange", "Electric colors", "Black", "Pure white", "Yellow-greens"
    ],
    bestMetals: ["Silver", "Pewter", "Rose Gold", "Brushed metals"],
    makeupTips: [
      "Cool-toned foundations with pink undertones",
      "Rose or mauve lipsticks",
      "Soft, muted eyeshadows",
      "Brown or navy mascara"
    ],
    fabricRecommendations: [
      "Soft cotton", "Cashmere", "Soft wool", "Chiffon", "Soft denim", "Matte fabrics"
    ],
    colors: [
      { name: "Airforce Blue", hex: "#5D8AA8", category: "neutral" },
      { name: "Amethyst", hex: "#9966CC", category: "accent" },
      { name: "Burgundy", hex: "#800020", category: "statement" },
      { name: "Cherry", hex: "#DE3163", category: "accent" },
      { name: "Clover", hex: "#009E60", category: "accent" },
      { name: "Coral Red", hex: "#FF4040", category: "accent" },
      { name: "Cornflower", hex: "#6495ED", category: "accent" },
      { name: "Cyclamen", hex: "#F56FA1", category: "accent" },
      { name: "Dark Blue Grey", hex: "#666699", category: "neutral" },
      { name: "Delph", hex: "#1560BD", category: "accent" },
      { name: "Duck Egg", hex: "#C3E4E8", category: "accent" },
      { name: "Dusty Pink", hex: "#D0A9AA", category: "accent" },
      { name: "French Navy", hex: "#003153", category: "neutral" },
      { name: "Hyacinth", hex: "#B09CC9", category: "accent" },
      { name: "Jade", hex: "#00A86B", category: "accent" },
      { name: "Lavender", hex: "#B57EDC", category: "accent" },
      { name: "Light Blue Grey", hex: "#A8C3D8", category: "neutral" },
      { name: "Lilac", hex: "#C8A2C8", category: "accent" },
      { name: "Mushroom", hex: "#C4B5A0", category: "neutral" },
      { name: "Musk Pink", hex: "#E4C2D5", category: "accent" },
      { name: "Pastel Aqua", hex: "#AEEEEE", category: "accent" },
      { name: "Pastel Jade", hex: "#77DD77", category: "accent" },
      { name: "Pastel Rose", hex: "#FFD1DC", category: "accent" },
      { name: "Pink Beige", hex: "#DEC4B0", category: "neutral" },
      { name: "Plum", hex: "#8E4585", category: "statement" },
      { name: "Powder Blue", hex: "#B0E0E6", category: "accent" },
      { name: "Powder Pink", hex: "#FFB6C1", category: "accent" },
      { name: "Primrose", hex: "#E6E082", category: "accent" },
      { name: "Raspberry", hex: "#E30B5D", category: "accent" },
      { name: "Rose", hex: "#FF007F", category: "accent" },
      { name: "Rose Brown", hex: "#B57281", category: "neutral" },
      { name: "Rose Madder", hex: "#E32636", category: "accent" },
      { name: "Sea Green", hex: "#2E8B57", category: "accent" },
      { name: "Sky Blue", hex: "#87CEEB", category: "accent" },
      { name: "Smoked Grape", hex: "#66424D", category: "neutral" },
      { name: "Soft White", hex: "#FAF9F6", category: "neutral" }
    ]
  },
  Autumn: {
    name: "Autumn",
    emoji: "🍂",
    description: "Warm palette with rich, earthy hues",
    characteristics: [
      "Warm undertones",
      "Rich and earthy",
      "Orange-based colors",
      "Deep and muted",
      "Medium to low contrast"
    ],
    shoppingTips: [
      "Look for warm, muted colors with golden or orange undertones",
      "Choose ivory or beige over white",
      "Select brown or olive over black for basics",
      "Pick rust and terracotta shades",
      "Choose gold or copper jewelry"
    ],
    avoidColors: [
      "Cool pinks", "Icy blues", "Black", "Pure white", "Cool grays"
    ],
    bestMetals: ["Gold", "Copper", "Bronze", "Brass", "Antique metals"],
    makeupTips: [
      "Warm-toned foundations with golden undertones",
      "Brick or rust lipsticks",
      "Earth-toned eyeshadows",
      "Brown or bronze mascara"
    ],
    fabricRecommendations: [
      "Tweed", "Corduroy", "Wool", "Velvet", "Suede", "Heavy cotton"
    ],
    colors: [
      { name: "Amber", hex: "#FFBF00", category: "accent" },
      { name: "Apple Jade", hex: "#7BA05B", category: "accent" },
      { name: "Apricot", hex: "#FBCEB1", category: "accent" },
      { name: "Beige", hex: "#F5F5DC", category: "neutral" },
      { name: "Brick", hex: "#CB4154", category: "statement" },
      { name: "Bronze", hex: "#CD7F32", category: "metal" },
      { name: "Camel", hex: "#C19A6B", category: "neutral" },
      { name: "Chestnut", hex: "#954535", category: "neutral" },
      { name: "Coffee", hex: "#6F4E37", category: "neutral" },
      { name: "Coral", hex: "#FF7F50", category: "accent" },
      { name: "Dark Brown", hex: "#654321", category: "neutral" },
      { name: "Dark Olive", hex: "#556B2F", category: "neutral" },
      { name: "Forest Green", hex: "#228B22", category: "statement" },
      { name: "Geranium", hex: "#E63946", category: "accent" },
      { name: "Grass Green", hex: "#7CFC00", category: "accent" },
      { name: "Heliotrope", hex: "#DF73FF", category: "accent" },
      { name: "Khaki", hex: "#C3B091", category: "neutral" },
      { name: "Kingfisher", hex: "#009B7D", category: "accent" },
      { name: "Light Olive", hex: "#ACAD58", category: "neutral" },
      { name: "Light Sage", hex: "#BCB88A", category: "neutral" },
      { name: "Lime Green", hex: "#32CD32", category: "accent" },
      { name: "Lizard Grey", hex: "#97947C", category: "neutral" },
      { name: "Marine Navy", hex: "#00293C", category: "neutral" },
      { name: "Mid Peach", hex: "#FFCBA4", category: "accent" },
      { name: "Moss Green", hex: "#8A9A5B", category: "accent" },
      { name: "Mustard", hex: "#FFDB58", category: "accent" },
      { name: "Old Gold", hex: "#CFB53B", category: "metal" },
      { name: "Orange", hex: "#FFA500", category: "statement" },
      { name: "Oyster", hex: "#DDD6C7", category: "neutral" },
      { name: "Peacock", hex: "#005F69", category: "statement" },
      { name: "Rosewood", hex: "#9E4244", category: "accent" },
      { name: "Royal Purple", hex: "#7851A9", category: "statement" },
      { name: "Rust", hex: "#B7410E", category: "statement" },
      { name: "Saffron", hex: "#F4C430", category: "accent" },
      { name: "Tan", hex: "#D2B48C", category: "neutral" },
      { name: "Yellow Ochre", hex: "#CC7722", category: "accent" }
    ]
  }
};

// Helper function to get color by name across all seasons
export function findColorByName(colorName: string): ColorInfo | undefined {
  for (const season of Object.values(seasonalColorData)) {
    const color = season.colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    if (color) return color;
  }
  return undefined;
}

// Helper function to get contrasting seasons
export function getContrastingSeasons(season: string): string[] {
  const contrasts = {
    Winter: ['Autumn', 'Spring'],
    Spring: ['Winter', 'Summer'],
    Summer: ['Spring', 'Autumn'],
    Autumn: ['Summer', 'Winter']
  };
  return contrasts[season as keyof typeof contrasts] || [];
}