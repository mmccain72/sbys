import { useState } from "react";

interface ColorPaletteReferenceProps {
  selectedSeason?: "Winter" | "Spring" | "Summer" | "Autumn" | null;
  showAll?: boolean;
  setCurrentPage: (page: string) => void;
}

export function ColorPaletteReference({ selectedSeason, showAll = false, setCurrentPage }: ColorPaletteReferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const seasonalColors = {
    Winter: {
      name: "Winter",
      description: "Cool, clear, and intense colors",
      colors: ["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#FF69B4", "#800080", "#008000", "#FFD700"],
      characteristics: ["High contrast", "Cool undertones", "Jewel tones", "Pure colors"]
    },
    Spring: {
      name: "Spring",
      description: "Warm, clear, and bright colors",
      colors: ["#FFD700", "#FF6347", "#32CD32", "#FF69B4", "#00CED1", "#FFA500", "#ADFF2F", "#FF1493"],
      characteristics: ["Warm undertones", "Clear and bright", "Yellow-based colors", "Fresh and vibrant"]
    },
    Summer: {
      name: "Summer",
      description: "Cool, soft, and muted colors",
      colors: ["#E6E6FA", "#B0C4DE", "#F0E68C", "#DDA0DD", "#98FB98", "#F5DEB3", "#D3D3D3", "#FFB6C1"],
      characteristics: ["Cool undertones", "Soft and muted", "Blue-based colors", "Gentle and subtle"]
    },
    Autumn: {
      name: "Autumn",
      description: "Warm, deep, and muted colors",
      colors: ["#8B4513", "#D2691E", "#B8860B", "#CD853F", "#A0522D", "#DAA520", "#BC8F8F", "#F4A460"],
      characteristics: ["Warm undertones", "Rich and earthy", "Orange-based colors", "Deep and muted"]
    }
  };

  const seasonsToShow = selectedSeason ? [selectedSeason] : Object.keys(seasonalColors) as Array<keyof typeof seasonalColors>;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedSeason ? `${selectedSeason} Color Palette` : "Seasonal Color Palettes"}
        </h3>
        {!selectedSeason && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      {/* Reference Image */}
      <div className="mb-6">
        <img 
          src="/seasonal-color-palette.png" 
          alt="Seasonal Color Palette Reference"
          className="w-full rounded-lg shadow-sm"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Professional seasonal color analysis reference
        </p>
      </div>

      {/* Interactive Color Swatches */}
      <div className="space-y-6">
        {seasonsToShow.map((season) => {
          const seasonData = seasonalColors[season];
          const shouldShow = selectedSeason || showAll || isExpanded;
          
          return (
            <div key={season} className={`${!shouldShow && season !== "Winter" ? "hidden" : ""}`}>
              <div className="flex items-center gap-3 mb-3">
                <h4 className="font-medium text-gray-900">{seasonData.name}</h4>
                <span className="text-sm text-gray-600">{seasonData.description}</span>
              </div>
              
              {/* Color Swatches */}
              <div className="flex flex-wrap gap-2 mb-3">
                {seasonData.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              
              {/* Characteristics */}
              <div className="flex flex-wrap gap-2">
                {seasonData.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!selectedSeason && !isExpanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View all seasonal palettes →
          </button>
        </div>
      )}
    </div>
  );
}
