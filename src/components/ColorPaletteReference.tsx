import { useState } from "react";
import { seasonalColorData, type ColorInfo } from "../data/seasonalColors";

interface ColorPaletteReferenceProps {
  selectedSeason?: "Winter" | "Spring" | "Summer" | "Autumn" | null;
  showAll?: boolean;
  setCurrentPage: (page: string) => void;
}

export function ColorPaletteReference({ selectedSeason, setCurrentPage }: ColorPaletteReferenceProps) {
  const [activeSeason, setActiveSeason] = useState<string>(selectedSeason || "Winter");
  const [activeTab, setActiveTab] = useState<'colors' | 'shopping' | 'styling' | 'makeup'>('colors');
  const [colorFilter, setColorFilter] = useState<'all' | 'neutral' | 'accent' | 'statement' | 'metal'>('all');
  const [searchTerm, setSearchTerm] = useState("");

  const seasonData = seasonalColorData[activeSeason];

  // Filter colors based on category and search
  const filteredColors = seasonData.colors.filter(color => {
    const matchesFilter = colorFilter === 'all' || color.category === colorFilter;
    const matchesSearch = searchTerm === '' || 
      color.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group colors by category for display
  const colorsByCategory = {
    neutral: filteredColors.filter(c => c.category === 'neutral'),
    accent: filteredColors.filter(c => c.category === 'accent'),
    statement: filteredColors.filter(c => c.category === 'statement'),
    metal: filteredColors.filter(c => c.category === 'metal')
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">Your Personal Style Guide</h1>
        <p className="text-xl text-white/95 drop-shadow">Master your seasonal colors and transform your wardrobe</p>
      </div>

      {/* Season Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Select Your Season</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(seasonalColorData).map(([season, data]) => (
            <button
              key={season}
              onClick={() => setActiveSeason(season)}
              className={`p-4 rounded-xl transition-all duration-300 ${
                activeSeason === season
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="text-3xl mb-2">{data.emoji}</div>
              <div className="font-bold">{data.name}</div>
              <div className="text-xs mt-1">36 colors</div>
            </button>
          ))}
        </div>
        
        {/* Season Description */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <p className="text-gray-700 font-medium">{seasonData.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {seasonData.characteristics.map((char, idx) => (
              <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600">
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          {[
            { id: 'colors' as const, label: '🎨 Color Palette', count: seasonData.colors.length },
            { id: 'shopping' as const, label: '🛍️ Shopping Guide', count: null },
            { id: 'styling' as const, label: '👗 Styling Tips', count: null },
            { id: 'makeup' as const, label: '💄 Beauty Guide', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search colors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="neutral">Neutrals</option>
                  <option value="accent">Accents</option>
                  <option value="statement">Statements</option>
                  <option value="metal">Metals</option>
                </select>
              </div>

              {/* Color Categories */}
              {colorFilter === 'all' ? (
                <div className="space-y-6">
                  {Object.entries(colorsByCategory).map(([category, colors]) => (
                    colors.length > 0 && (
                      <div key={category}>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 capitalize">
                          {category === 'metal' ? 'Metallic Colors' : `${category} Colors`}
                          <span className="ml-2 text-sm text-gray-500">({colors.length})</span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((color) => (
                            <ColorSwatch key={color.name} color={color} />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {filteredColors.map((color) => (
                    <ColorSwatch key={color.name} color={color} />
                  ))}
                </div>
              )}

              {filteredColors.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No colors found matching your search.
                </div>
              )}
            </div>
          )}

          {/* Shopping Guide Tab */}
          {activeTab === 'shopping' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🛍️ Your Shopping Cheat Sheet
                </h3>
                <div className="space-y-3">
                  {seasonData.shoppingTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-700 mb-4">
                    ❌ Colors to Avoid
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {seasonData.avoidColors.map((color, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-700 mb-4">
                    ✨ Best Metals
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {seasonData.bestMetals.map((metal, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                        {metal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-700 mb-4">
                  👕 Recommended Fabrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {seasonData.fabricRecommendations.map((fabric, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 text-center">
                      <span className="text-gray-700 font-medium">{fabric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Styling Tips Tab */}
          {activeTab === 'styling' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  💡 Pro Styling Tips for {seasonData.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Best Color Combinations:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {getColorCombinations(activeSeason).map((combo, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-3">
                          {combo.colors.map((hex, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{combo.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Wardrobe Essentials:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {getWardrobeEssentials(activeSeason).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-700 mb-4">
                  🎯 Quick Style Rules
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {getStyleRules(activeSeason).map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">→</span>
                      <p className="text-gray-700 text-sm">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Makeup Tab */}
          {activeTab === 'makeup' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-pink-700 mb-4">
                  💄 Makeup Colors for {seasonData.name}
                </h3>
                <div className="space-y-3">
                  {seasonData.makeupTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-pink-500 mt-1">💋</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {getMakeupPalette(activeSeason).map((category, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-3">{category.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <button 
          onClick={() => setCurrentPage('quiz')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="text-3xl mb-2">🎨</div>
          <h3 className="font-bold text-lg mb-1">Retake Quiz</h3>
          <p className="text-sm opacity-90">Confirm your seasonal type</p>
        </button>

        <button 
          onClick={() => setCurrentPage('browse')}
          className="bg-gradient-to-r from-blue-500 to-teal-500 text-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="text-3xl mb-2">🛍️</div>
          <h3 className="font-bold text-lg mb-1">Shop Your Colors</h3>
          <p className="text-sm opacity-90">Browse curated products</p>
        </button>

        <button 
          onClick={() => setCurrentPage('outfits')}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="text-3xl mb-2">👗</div>
          <h3 className="font-bold text-lg mb-1">Build Outfits</h3>
          <p className="text-sm opacity-90">Create perfect combinations</p>
        </button>
      </div>
    </div>
  );
}

// Color Swatch Component
function ColorSwatch({ color }: { color: ColorInfo }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className="w-12 h-12 rounded-full border border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-125 cursor-pointer"
          style={{ backgroundColor: color.hex }}
        />
        {showTooltip && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-[100] shadow-2xl pointer-events-none">
            <div className="font-semibold text-white">{color.name}</div>
            <div className="text-gray-400 text-[10px]">{color.hex}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for content
function getColorCombinations(season: string) {
  const combinations: Record<string, Array<{colors: string[], description: string}>> = {
    Winter: [
      { colors: ['#000000', '#FFFFFF', '#FF2400'], description: 'Classic high contrast' },
      { colors: ['#000080', '#C0C0C0', '#FC0FC0'], description: 'Navy with pops of pink' },
      { colors: ['#800020', '#D3D3D3', '#FFD700'], description: 'Burgundy elegance' },
      { colors: ['#4169E1', '#FFFFFF', '#E30B5C'], description: 'Royal blue statement' }
    ],
    Spring: [
      { colors: ['#F5F5DC', '#FF7F50', '#8DB600'], description: 'Fresh coral garden' },
      { colors: ['#FFFDD0', '#00FFFF', '#FFB300'], description: 'Bright and cheerful' },
      { colors: ['#D2B48C', '#E35335', '#74C365'], description: 'Warm earth tones' },
      { colors: ['#003366', '#FFE5B4', '#FC8EAC'], description: 'Navy with warm accents' }
    ],
    Summer: [
      { colors: ['#FAF9F6', '#B57EDC', '#D0A9AA'], description: 'Soft romantic' },
      { colors: ['#003153', '#B0E0E6', '#FFB6C1'], description: 'Navy with pastels' },
      { colors: ['#666699', '#C8A2C8', '#AEEEEE'], description: 'Cool harmony' },
      { colors: ['#DEC4B0', '#E30B5D', '#87CEEB'], description: 'Beige with accents' }
    ],
    Autumn: [
      { colors: ['#C19A6B', '#B7410E', '#228B22'], description: 'Rich earth tones' },
      { colors: ['#654321', '#FFBF00', '#FFA500'], description: 'Warm browns & golds' },
      { colors: ['#556B2F', '#CB4154', '#F4C430'], description: 'Olive with warm pops' },
      { colors: ['#F5F5DC', '#E63946', '#8A9A5B'], description: 'Beige with accents' }
    ]
  };
  return combinations[season] || [];
}

function getWardrobeEssentials(season: string) {
  const essentials: Record<string, Array<{icon: string, name: string}>> = {
    Winter: [
      { icon: '🧥', name: 'Black leather jacket' },
      { icon: '👔', name: 'Crisp white shirt' },
      { icon: '👗', name: 'Jewel-tone dress' },
      { icon: '👖', name: 'Dark wash jeans' },
      { icon: '🧣', name: 'Silver accessories' },
      { icon: '👠', name: 'Patent leather shoes' }
    ],
    Spring: [
      { icon: '🧥', name: 'Camel trench coat' },
      { icon: '👔', name: 'Coral blouse' },
      { icon: '👗', name: 'Floral sundress' },
      { icon: '👖', name: 'Light wash denim' },
      { icon: '🧣', name: 'Gold jewelry' },
      { icon: '👠', name: 'Nude pumps' }
    ],
    Summer: [
      { icon: '🧥', name: 'Soft cardigan' },
      { icon: '👔', name: 'Powder blue shirt' },
      { icon: '👗', name: 'Pastel midi dress' },
      { icon: '👖', name: 'Soft gray trousers' },
      { icon: '🧣', name: 'Rose gold accents' },
      { icon: '👠', name: 'Blush tone shoes' }
    ],
    Autumn: [
      { icon: '🧥', name: 'Brown leather jacket' },
      { icon: '👔', name: 'Rust colored top' },
      { icon: '👗', name: 'Olive wrap dress' },
      { icon: '👖', name: 'Khaki pants' },
      { icon: '🧣', name: 'Bronze accessories' },
      { icon: '👠', name: 'Tan ankle boots' }
    ]
  };
  return essentials[season] || [];
}

function getStyleRules(season: string) {
  const rules: Record<string, string[]> = {
    Winter: [
      'Create high contrast between light and dark pieces',
      'Choose one statement jewel tone per outfit',
      'Pair cool neutrals (black, gray, white) as your base',
      'Add metallic accents in silver or white gold',
      'Opt for structured, tailored silhouettes',
      'Use icy pastels as accent colors only'
    ],
    Spring: [
      'Layer warm neutrals with bright accent colors',
      'Mix and match cheerful prints and patterns',
      'Choose gold or warm-toned accessories',
      'Incorporate at least one warm color per outfit',
      'Opt for light, fresh fabrics and textures',
      'Avoid heavy, dark colors that weigh down your look'
    ],
    Summer: [
      'Build outfits with tone-on-tone color schemes',
      'Layer different shades of the same color family',
      'Choose soft, flowing fabrics over structured pieces',
      'Use rose gold or brushed metal accessories',
      'Keep contrast low to medium for harmony',
      'Add interest with texture rather than bold colors'
    ],
    Autumn: [
      'Mix rich, warm colors in layers',
      'Combine different textures for depth',
      'Choose antique or burnished metal finishes',
      'Build outfits around earth tone neutrals',
      'Add warmth with golden or rust accents',
      'Avoid icy or cool-toned colors'
    ]
  };
  return rules[season] || [];
}

function getMakeupPalette(season: string) {
  const palettes: Record<string, Array<{name: string, colors: Array<{name: string, hex: string}>}>> = {
    Winter: [
      {
        name: 'Lip Colors',
        colors: [
          { name: 'True Red', hex: '#FF0000' },
          { name: 'Berry', hex: '#8B0051' },
          { name: 'Fuchsia', hex: '#FF00FF' },
          { name: 'Wine', hex: '#722F37' }
        ]
      },
      {
        name: 'Eye Shadows',
        colors: [
          { name: 'Silver', hex: '#C0C0C0' },
          { name: 'Charcoal', hex: '#36454F' },
          { name: 'Navy', hex: '#000080' },
          { name: 'Plum', hex: '#8B008B' }
        ]
      },
      {
        name: 'Blush',
        colors: [
          { name: 'Cool Pink', hex: '#FFC0CB' },
          { name: 'Rose', hex: '#FF007F' },
          { name: 'Berry', hex: '#B5338A' }
        ]
      }
    ],
    Spring: [
      {
        name: 'Lip Colors',
        colors: [
          { name: 'Coral', hex: '#FF7F50' },
          { name: 'Peach', hex: '#FFDAB9' },
          { name: 'Warm Pink', hex: '#FF69B4' },
          { name: 'Orange Red', hex: '#FF4500' }
        ]
      },
      {
        name: 'Eye Shadows',
        colors: [
          { name: 'Gold', hex: '#FFD700' },
          { name: 'Warm Brown', hex: '#964B00' },
          { name: 'Peach', hex: '#FFCBA4' },
          { name: 'Turquoise', hex: '#40E0D0' }
        ]
      },
      {
        name: 'Blush',
        colors: [
          { name: 'Peach', hex: '#FFCBA4' },
          { name: 'Coral', hex: '#FF7F50' },
          { name: 'Apricot', hex: '#FBCEB1' }
        ]
      }
    ],
    Summer: [
      {
        name: 'Lip Colors',
        colors: [
          { name: 'Rose', hex: '#FF66CC' },
          { name: 'Mauve', hex: '#E0B0FF' },
          { name: 'Soft Pink', hex: '#FFB6C1' },
          { name: 'Berry', hex: '#8B3A62' }
        ]
      },
      {
        name: 'Eye Shadows',
        colors: [
          { name: 'Soft Gray', hex: '#B8B8B8' },
          { name: 'Lavender', hex: '#E6E6FA' },
          { name: 'Soft Blue', hex: '#ADD8E6' },
          { name: 'Dusty Rose', hex: '#DCAE96' }
        ]
      },
      {
        name: 'Blush',
        colors: [
          { name: 'Soft Rose', hex: '#FFB6C1' },
          { name: 'Dusty Pink', hex: '#D0A9AA' },
          { name: 'Mauve', hex: '#E0B0FF' }
        ]
      }
    ],
    Autumn: [
      {
        name: 'Lip Colors',
        colors: [
          { name: 'Brick', hex: '#CB4154' },
          { name: 'Rust', hex: '#B7410E' },
          { name: 'Bronze', hex: '#CD7F32' },
          { name: 'Terracotta', hex: '#CC4E5C' }
        ]
      },
      {
        name: 'Eye Shadows',
        colors: [
          { name: 'Bronze', hex: '#CD7F32' },
          { name: 'Olive', hex: '#708238' },
          { name: 'Rust', hex: '#B7410E' },
          { name: 'Gold', hex: '#FFD700' }
        ]
      },
      {
        name: 'Blush',
        colors: [
          { name: 'Terracotta', hex: '#CC4E5C' },
          { name: 'Peach', hex: '#FFCBA4' },
          { name: 'Bronze', hex: '#CD7F32' }
        ]
      }
    ]
  };
  return palettes[season] || [];
}