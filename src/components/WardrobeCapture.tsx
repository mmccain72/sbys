import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  removeBackground, 
  preloadModel, 
  cleanupModel,
  isWebGLAvailable,
  blobToBase64 
} from "../lib/backgroundRemoval";

interface WardrobeCaptureProps {
  onItemAdded: () => void;
  onClose: () => void;
}

// Device detection helpers
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = () => /Android/.test(navigator.userAgent);
const isMobile = () => isIOS() || isAndroid() || window.innerWidth <= 768;
const supportsVibration = () => 'vibrate' in navigator;

// Haptic feedback helper
const hapticFeedback = (pattern: number | number[] = 50) => {
  if (supportsVibration()) {
    navigator.vibrate(pattern);
  }
};

export function WardrobeCapture({ onItemAdded, onClose }: WardrobeCaptureProps) {
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("upload");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<"tops" | "bottoms" | "dresses" | "shoes" | "accessories">("tops");
  const [itemBrand, setItemBrand] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);
  const uploadWardrobeItem = useMutation(api.wardrobe.uploadWardrobeItem);
  const [modelLoading, setModelLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [webGLSupported] = useState(() => isWebGLAvailable());

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
      setCaptureMode("upload");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        // Start loading model when user captures a photo
        loadModelIfNeeded();
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera, loadModelIfNeeded]);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      // Start loading model when user selects a file
      loadModelIfNeeded();
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert base64 to blob
  const base64ToBlob = (base64: string, contentType: string = "image/jpeg"): Blob => {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  // Process and save the wardrobe item
  const processAndSave = async () => {
    if (!capturedImage || !itemName.trim()) {
      toast.error("Please provide an image and item name");
      return;
    }

    if (!webGLSupported) {
      toast.error("Your browser doesn't support WebGL. Background removal may be slower.");
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Process image with client-side background removal
      const imageSource = selectedFile || capturedImage;
      
      const processedResult = await removeBackground(
        imageSource,
        {
          quality: 0.9,
          edgeBlur: 2,
          targetWidth: 1024,
          targetHeight: 1024,
        },
        (progress) => setProcessingProgress(progress)
      );

      // Upload original image
      const originalUploadUrl = await generateUploadUrl();
      const originalBlob = selectedFile || base64ToBlob(capturedImage);
      
      const originalUploadResponse = await fetch(originalUploadUrl, {
        method: "POST",
        headers: { "Content-Type": originalBlob.type },
        body: originalBlob,
      });

      if (!originalUploadResponse.ok) {
        throw new Error("Failed to upload original image");
      }

      const { storageId: originalStorageId } = await originalUploadResponse.json();

      // Upload processed image
      const processedUploadUrl = await generateUploadUrl();
      
      const processedUploadResponse = await fetch(processedUploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: processedResult.blob,
      });

      if (!processedUploadResponse.ok) {
        throw new Error("Failed to upload processed image");
      }

      const { storageId: processedStorageId } = await processedUploadResponse.json();

      // Convert processed blob to base64 for preview
      const processedImageUrl = await blobToBase64(processedResult.blob);

      // Save wardrobe item
      await uploadWardrobeItem({
        name: itemName,
        category: processedResult.category || itemCategory,
        originalImageId: originalStorageId,
        processedImageId: processedStorageId,
        processedImageUrl: processedImageUrl,
        colors: processedResult.dominantColors || [],
        tags: ["clothing"], // Default tags
        brand: itemBrand || undefined,
        notes: itemNotes || undefined,
      });

      toast.success(`Item added to your wardrobe! (Processed in ${(processedResult.processingTime / 1000).toFixed(1)}s)`);
      onItemAdded();
      resetForm();
    } catch (error) {
      console.error("Error processing wardrobe item:", error);
      toast.error("Failed to add item to wardrobe. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setItemName("");
    setItemBrand("");
    setItemNotes("");
    setItemCategory("tops");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load TensorFlow model when user selects an image or starts camera
  const loadModelIfNeeded = useCallback(async () => {
    if (!modelLoading && !webGLSupported) {
      console.warn("WebGL not supported, model may run slowly");
    }
    
    if (!modelLoading) {
      setModelLoading(true);
      try {
        await preloadModel();
        setModelLoading(false);
        console.log("Background removal model loaded");
      } catch (error) {
        console.error("Failed to load model:", error);
        setModelLoading(false);
        toast.warning("Background removal model failed to load. Will use original image.");
      }
    }
  }, [modelLoading, webGLSupported]);

  // Cleanup model on unmount
  useEffect(() => {
    return () => {
      cleanupModel();
    };
  }, []);

  // Start camera when mode changes
  useEffect(() => {
    if (captureMode === "camera" && !stream) {
      startCamera();
    } else if (captureMode === "upload" && stream) {
      stopCamera();
    }
  }, [captureMode, stream, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add to Wardrobe</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Model loading indicator */}
          {modelLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Loading AI model for background removal... This only happens once.
            </div>
          )}
          
          {/* WebGL warning */}
          {!webGLSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              WebGL is not supported. Background removal will work but may be slower.
            </div>
          )}
          {/* Capture Mode Toggle */}
          <div className="flex space-x-4">
            <button
              onClick={() => setCaptureMode("upload")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                captureMode === "upload"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📁 Upload Photo
            </button>
            <button
              onClick={() => setCaptureMode("camera")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                captureMode === "camera"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📷 Take Photo
            </button>
          </div>

          {/* Image Capture/Upload Area */}
          <div className="space-y-4">
            {captureMode === "camera" && !capturedImage && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: "400px" }}
                />
                {/* Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="flex items-center justify-center h-full">
                    <div className="border-2 border-white border-dashed rounded-lg w-3/4 h-3/4 opacity-50"></div>
                  </div>
                  <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black bg-opacity-50 py-2">
                    Position clothing item within the frame
                  </p>
                </div>
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-purple-600 py-3 px-6 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Capture
                </button>
              </div>
            )}

            {captureMode === "upload" && !capturedImage && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-600 mb-4">
                  Upload a photo of your clothing item
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Choose Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  For best results, use a plain background
                </p>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured item"
                    className="w-full rounded-lg"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setSelectedFile(null);
                      if (captureMode === "camera") {
                        startCamera();
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Item Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., Blue Denim Jacket"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="tops">Tops</option>
                      <option value="bottoms">Bottoms</option>
                      <option value="dresses">Dresses</option>
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand (optional)
                    </label>
                    <input
                      type="text"
                      value={itemBrand}
                      onChange={(e) => setItemBrand(e.target.value)}
                      placeholder="e.g., Zara, H&M"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Any additional details..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas for image capture (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          {capturedImage && (
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processAndSave}
                disabled={isProcessing || !itemName.trim() || modelLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  isProcessing || !itemName.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    {processingProgress > 0 ? `Processing ${processingProgress}%...` : "Processing..."}
                  </span>
                ) : modelLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Loading AI Model...
                  </span>
                ) : (
                  "Add to Wardrobe"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}