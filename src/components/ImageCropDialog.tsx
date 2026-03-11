import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropDialog({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropSize = 400; 

  useEffect(() => {
    if (open && imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        const initialScale = Math.max(cropSize / img.width, cropSize / img.height) * 1.1;
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setImageLoaded(true);
      };
      img.src = imageSrc;
    } else {
      setImageLoaded(false);
    }
  }, [open, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ 
        x: e.clientX - position.x - rect.left - cropSize / 2, 
        y: e.clientY - position.y - rect.top - cropSize / 2 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + cropSize / 2;
      const centerY = rect.top + cropSize / 2;
      const newX = e.clientX - centerX - dragStart.x;
      const newY = e.clientY - centerY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setScale(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = cropSize;
      canvas.height = cropSize;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();
      const scaledWidth = imageSize.width * scale;
      const scaledHeight = imageSize.height * scale;
      const offsetX = (cropSize / 2) + position.x - (scaledWidth / 2);
      const offsetY = (cropSize / 2) + position.y - (scaledHeight / 2);

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "avatar-cropped.png", { type: "image/png" });
          onCropComplete(file);
          onOpenChange(false);
        }
      }, "image/png", 0.95);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4">
            <div
              ref={containerRef}
              className="relative overflow-hidden"
              style={{ width: cropSize, height: cropSize, minHeight: cropSize }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div className="absolute inset-0 pointer-events-none z-20">
                <div
                  className="absolute border-4 border-white rounded-full"
                  style={{
                    width: cropSize,
                    height: cropSize,
                    top: 0,
                    left: 0,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)"
                  }}
                />
              </div>
              <div
                className="absolute cursor-move z-10"
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  left: (cropSize / 2) + position.x - (scaledWidth / 2),
                  top: (cropSize / 2) + position.y - (scaledHeight / 2),
                  maxWidth: cropSize * 2,
                  maxHeight: cropSize * 2,
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop"
                  className="w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-center py-2">
            <p>Arraste para mover • Use a roda do mouse para zoom</p>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="mt-4 pt-4 border-t z-30 relative bg-background">
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

