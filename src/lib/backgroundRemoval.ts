// Dynamic imports for better code splitting
let tf: any = null;
let bodySegmentation: any = null;

// Types and interfaces
interface BackgroundRemovalOptions {
  quality?: number; // 0-1, default 0.9
  edgeBlur?: number; // Pixels to blur at edges, default 2
  targetWidth?: number; // Max width for processing, default 1024
  targetHeight?: number; // Max height for processing, default 1024
}

interface ProcessingResult {
  blob: Blob;
  width: number;
  height: number;
  dominantColors: string[];
  category?: string;
  processingTime: number;
}

// Model singleton to avoid re-loading
let segmenterModel: any = null;
let modelLoadPromise: Promise<any> | null = null;

// Dynamically load TensorFlow.js modules
async function loadTensorFlowModules() {
  if (tf && bodySegmentation) {
    return;
  }
  
  // Dynamic imports for code splitting
  const [tfModule, segmentationModule] = await Promise.all([
    import('@tensorflow/tfjs'),
    import('@tensorflow-models/body-segmentation')
  ]);
  
  tf = tfModule;
  bodySegmentation = segmentationModule;
}

// Initialize and cache the segmentation model
async function getSegmenter(): Promise<any> {
  if (segmenterModel) {
    return segmenterModel;
  }

  if (modelLoadPromise) {
    return modelLoadPromise;
  }

  modelLoadPromise = (async () => {
    // Load TensorFlow modules first
    await loadTensorFlowModules();
    
    try {
      // Set WebGL backend for better performance
      await tf.setBackend('webgl');
      await tf.ready();

      // Use MediaPipeSelfieSegmentation for better mobile performance
      const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig = {
        runtime: 'mediapipe',
        modelType: 'landscape', // Better for full body/clothing
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      };

      segmenterModel = await bodySegmentation.createSegmenter(model, segmenterConfig);
      return segmenterModel;
    } catch (error) {
      // Fallback to BodyPix if MediaPipe fails
      console.warn('MediaPipe failed, falling back to BodyPix:', error);
      
      const model = bodySegmentation.SupportedModels.BodyPix;
      const segmenterConfig = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75, // Lower multiplier for better mobile performance
        quantBytes: 4,
      };

      segmenterModel = await bodySegmentation.createSegmenter(model, segmenterConfig);
      return segmenterModel;
    }
  })();

  return modelLoadPromise;
}

// Preload the model (call this when the component mounts)
export async function preloadModel(): Promise<void> {
  await loadTensorFlowModules();
  await getSegmenter();
}

// Resize image while maintaining aspect ratio
function resizeImage(
  img: HTMLImageElement | HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = Math.min(width, maxWidth);
      height = width / aspectRatio;
    } else {
      height = Math.min(height, maxHeight);
      width = height * aspectRatio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
}

// Extract dominant colors from image
function extractDominantColors(imageData: ImageData): string[] {
  const colorMap = new Map<string, number>();
  const data = imageData.data;
  const pixelCount = imageData.width * imageData.height;
  const sampleRate = Math.max(1, Math.floor(pixelCount / 10000)); // Sample ~10k pixels max

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Quantize colors to reduce variations
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;

    const color = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }

  // Sort by frequency and return top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);

  // Ensure we always return at least 3 colors
  while (sortedColors.length < 3) {
    sortedColors.push('#808080'); // Default gray
  }

  return sortedColors;
}

// Detect clothing category from image characteristics
function detectClothingCategory(aspectRatio: number, topPosition: number): string {
  // Simple heuristic based on aspect ratio and position
  if (aspectRatio > 1.3) {
    return 'dresses'; // Wide images often contain dresses
  } else if (topPosition < 0.3) {
    return 'tops'; // Item in upper portion
  } else if (topPosition > 0.5) {
    return 'bottoms'; // Item in lower portion
  } else if (aspectRatio < 0.8) {
    return 'shoes'; // Narrow items might be shoes
  }
  
  return 'tops'; // Default
}

// Apply edge blur for smoother cutouts
function applyEdgeBlur(
  ctx: CanvasRenderingContext2D,
  mask: ImageData,
  blurRadius: number
): void {
  if (blurRadius <= 0) return;

  const width = mask.width;
  const height = mask.height;
  const data = mask.data;

  // Simple box blur for edges
  const tempData = new Uint8ClampedArray(data);

  for (let y = blurRadius; y < height - blurRadius; y++) {
    for (let x = blurRadius; x < width - blurRadius; x++) {
      const idx = (y * width + x) * 4 + 3; // Alpha channel

      // Check if this is an edge pixel
      const current = data[idx];
      let isEdge = false;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + 3;
          if (Math.abs(data[neighborIdx] - current) > 128) {
            isEdge = true;
            break;
          }
        }
        if (isEdge) break;
      }

      if (isEdge) {
        // Apply blur to edge pixels
        let sum = 0;
        let count = 0;

        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + 3;
            sum += data[neighborIdx];
            count++;
          }
        }

        tempData[idx] = Math.round(sum / count);
      }
    }
  }

  // Copy blurred data back
  for (let i = 3; i < data.length; i += 4) {
    data[i] = tempData[i];
  }
}

// Main background removal function
export async function removeBackground(
  imageSource: string | File | Blob,
  options: BackgroundRemovalOptions = {},
  onProgress?: (progress: number) => void
): Promise<ProcessingResult> {
  const startTime = performance.now();

  const {
    quality = 0.9,
    edgeBlur = 2,
    targetWidth = 1024,
    targetHeight = 1024,
  } = options;

  try {
    // Report initial progress
    onProgress?.(10);

    // Load image
    const img = new Image();
    const imageUrl = typeof imageSource === 'string' 
      ? imageSource 
      : URL.createObjectURL(imageSource instanceof File ? imageSource : imageSource);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    if (typeof imageSource !== 'string') {
      URL.revokeObjectURL(imageUrl);
    }

    onProgress?.(20);

    // Calculate target dimensions
    const { width, height } = resizeImage(img, targetWidth, targetHeight);

    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);
    const originalImageData = ctx.getImageData(0, 0, width, height);

    onProgress?.(30);

    // Load segmentation model
    const segmenter = await getSegmenter();
    
    onProgress?.(50);

    // Perform segmentation
    const segmentation = await segmenter.segmentPeople(canvas, {
      flipHorizontal: false,
      multiSegmentation: false,
      segmentBodyParts: false,
    });

    onProgress?.(70);

    if (!segmentation || segmentation.length === 0) {
      console.warn('No person detected in image');
      // Return original image if no person detected
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', quality);
      });

      return {
        blob,
        width,
        height,
        dominantColors: extractDominantColors(originalImageData),
        processingTime: performance.now() - startTime,
      };
    }

    // Apply segmentation mask
    const mask = await segmentation[0].mask.toImageData();
    const maskData = mask.data;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Find bounding box of the person
    let minX = width, minY = height, maxX = 0, maxY = 0;

    for (let i = 0; i < maskData.length; i += 4) {
      const alpha = maskData[i + 3];
      
      if (alpha > 128) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      // Apply mask to image alpha channel
      data[i + 3] = alpha;
    }

    // Apply edge blur for smoother edges
    if (edgeBlur > 0) {
      applyEdgeBlur(ctx, imageData, edgeBlur);
    }

    // Put processed image back on canvas
    ctx.putImageData(imageData, 0, 0);

    onProgress?.(85);

    // Extract dominant colors from the segmented area
    const dominantColors = extractDominantColors(imageData);

    // Detect category based on bounding box
    const aspectRatio = (maxX - minX) / (maxY - minY);
    const topPosition = minY / height;
    const category = detectClothingCategory(aspectRatio, topPosition);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png', quality);
    });

    onProgress?.(100);

    // Clean up tensor memory
    segmentation[0].mask.dispose();

    return {
      blob,
      width,
      height,
      dominantColors,
      category,
      processingTime: performance.now() - startTime,
    };
  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
}

// Clean up resources when done
export async function cleanupModel(): Promise<void> {
  if (segmenterModel) {
    segmenterModel.dispose();
    segmenterModel = null;
    modelLoadPromise = null;
  }
}

// Check if WebGL is available
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Utility to convert blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}