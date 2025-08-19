import React, { useRef, useEffect } from 'react';

interface IconGeneratorProps {
  size: number;
  onGenerated: (dataUrl: string) => void;
}

export function IconGenerator({ size, onGenerated }: IconGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#9333ea'); // Purple
    gradient.addColorStop(1, '#7c3aed'); // Darker purple

    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add rounded corners
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = size * 0.2;
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Add icon content (fashion/style symbol)
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👗', size / 2, size / 2);

    // Generate data URL
    const dataUrl = canvas.toDataURL('image/png');
    onGenerated(dataUrl);
  }, [size, onGenerated]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
}

// Helper function to download generated icon
export function downloadIcon(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Component to generate all required PWA icons
export function PWAIconGenerator() {
  const [icons, setIcons] = React.useState<Record<string, string>>({});

  const handleIconGenerated = (size: number, dataUrl: string) => {
    setIcons(prev => ({ ...prev, [`${size}x${size}`]: dataUrl }));
  };

  const downloadAll = () => {
    Object.entries(icons).forEach(([size, dataUrl]) => {
      downloadIcon(dataUrl, `icon-${size}.png`);
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">PWA Icon Generator</h3>
      
      {/* Generate icons for different sizes */}
      <IconGenerator size={16} onGenerated={(dataUrl) => handleIconGenerated(16, dataUrl)} />
      <IconGenerator size={32} onGenerated={(dataUrl) => handleIconGenerated(32, dataUrl)} />
      <IconGenerator size={192} onGenerated={(dataUrl) => handleIconGenerated(192, dataUrl)} />
      <IconGenerator size={512} onGenerated={(dataUrl) => handleIconGenerated(512, dataUrl)} />

      {/* Preview generated icons */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Object.entries(icons).map(([size, dataUrl]) => (
          <div key={size} className="text-center">
            <img src={dataUrl} alt={`Icon ${size}`} className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{size}</p>
          </div>
        ))}
      </div>

      {Object.keys(icons).length === 4 && (
        <button
          onClick={downloadAll}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Download All Icons
        </button>
      )}
    </div>
  );
}
