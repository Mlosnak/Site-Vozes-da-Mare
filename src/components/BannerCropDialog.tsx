import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface BannerCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
}

export function BannerCropDialog({ 
  open, 
  onOpenChange, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 16/9,
  outputWidth = 1920,
  outputHeight = 1080
}: BannerCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewWidth = 640;
  const previewHeight = previewWidth / aspectRatio;

  useEffect(() => {
    if (open && imageSrc) {
      const img = new window.Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        const scaleX = previewWidth / img.width;
        const scaleY = previewHeight / img.height;
        const initialScale = Math.max(scaleX, scaleY) * 1.1;
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setImageLoaded(true);
      };
      img.src = imageSrc;
    } else {
      setImageLoaded(false);
    }
  }, [open, imageSrc, previewWidth, previewHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const scaleRatio = outputWidth / previewWidth;
      const scaledWidth = imageSize.width * scale * scaleRatio;
      const scaledHeight = imageSize.height * scale * scaleRatio;
      const offsetX = (outputWidth / 2) + (position.x * scaleRatio) - (scaledWidth / 2);
      const offsetY = (outputHeight / 2) + (position.y * scaleRatio) - (scaledHeight / 2);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "banner-cropped.jpg", { type: "image/jpeg" });
          onCropComplete(file);
          onOpenChange(false);
        }
      }, "image/jpeg", 0.92);
    };
    img.src = imageSrc;
  };

  if (!imageLoaded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">Carregando imagem...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem do Banner (1920x1080)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/50"
              style={{ width: previewWidth, height: previewHeight }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="absolute cursor-move"
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  left: (previewWidth / 2) + position.x - (scaledWidth / 2),
                  top: (previewHeight / 2) + position.y - (scaledHeight / 2),
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop"
                  className="w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                />
              </div>

              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[scale * 100]}
              onValueChange={([value]) => setScale(value / 100)}
              min={10}
              max={300}
              step={1}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Move className="h-4 w-4" />
            <span>Arraste para mover • Use a roda do mouse ou slider para zoom</span>
          </div>

          <div className="text-center text-xs text-muted-foreground bg-muted/50 py-2 rounded">
            Saída: {outputWidth}x{outputHeight} pixels (16:9)
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrop}>
            Aplicar Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
