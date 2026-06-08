'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, CropIcon, Check, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Always square (1:1)
const ASPECT = 1;
// Output is always a fixed-size square
const OUTPUT_SIZE = 400;

interface ImageUploadCropProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

// Create a pixel-unit square crop centered on the image
function makeSquareCropPx(imgWidth: number, imgHeight: number): Crop {
  const size = Math.floor(Math.min(imgWidth, imgHeight) * 0.8);
  return {
    unit: 'px',
    width: size,
    height: size,
    x: Math.floor((imgWidth - size) / 2),
    y: Math.floor((imgHeight - size) / 2),
  };
}

async function getCroppedSquareBlob(
  imageEl: HTMLImageElement,
  pixelCrop: PixelCrop,
  filename: string,
): Promise<File> {
  const canvas = document.createElement('canvas');
  // Always render into a perfect square canvas
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const scaleX = imageEl.naturalWidth / imageEl.width;
  const scaleY = imageEl.naturalHeight / imageEl.height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    imageEl,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Canvas is empty'));
      resolve(new File([blob], filename.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

export default function ImageUploadCrop({
  value,
  onChange,
  folder = 'categories',
  label = 'Category Image',
}: ImageUploadCropProps) {
  const [srcImg, setSrcImg] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [originalFilename, setOriginalFilename] = useState('image.jpg');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setOriginalFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSrcImg(reader.result as string);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(makeSquareCropPx(width, height));
  }, []);

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) {
      toast.error('Please make a crop selection first');
      return;
    }

    setUploading(true);
    try {
      const croppedFile = await getCroppedSquareBlob(imgRef.current, completedCrop, originalFilename);
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const { url } = await res.json();
      onChange(url);
      setShowCropper(false);
      setSrcImg(null);
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setSrcImg(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <div>
      <label className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider block mb-1.5">
        {label}
      </label>

      {/* Preview + Upload trigger */}
      <div className="flex items-center gap-4">
        {/* Square preview */}
        <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-brand-green-border/30 flex items-center justify-center overflow-hidden bg-brand-gold-light/30 flex-shrink-0">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-brand-foreground/25" />
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 flex-grow">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-brand-green text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-green/90 transition-colors shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            {value ? 'Change Image' : 'Upload & Crop'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-2 text-rose-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors border border-rose-200"
            >
              <X className="h-3.5 w-3.5" />
              Remove Image
            </button>
          )}
          <p className="text-[10px] text-brand-foreground/40 leading-tight">
            Square crop · JPEG, PNG or WebP · Max 5MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />

      {/* Crop modal */}
      {showCropper && srcImg && (
        <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <CropIcon className="h-5 w-5" />
                <div>
                  <span className="font-bold text-base block">Square Crop</span>
                  <span className="text-[10px] text-brand-green-light">
                    Output: {OUTPUT_SIZE}×{OUTPUT_SIZE}px · 1:1 ratio locked
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Crop area — no scroll, image self-constrains via viewport height */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-brand-foreground/50 text-center font-medium">
                Drag and resize the square handle. Ratio is locked to 1:1.
              </p>
              <div className="flex justify-center rounded-xl bg-[#1a1a1a]">
                <ReactCrop
                  crop={crop}
                  onChange={(_, pc) => setCrop(pc)}
                  onComplete={c => setCompletedCrop(c)}
                  aspect={ASPECT}
                  minWidth={60}
                  minHeight={60}
                  keepSelection
                >
                  <img
                    ref={imgRef}
                    src={srcImg}
                    alt="Crop source"
                    onLoad={onImageLoad}
                    style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(90vh - 230px)', objectFit: 'contain' }}
                  />
                </ReactCrop>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-2xl border border-brand-green-border/20 text-sm font-bold text-brand-foreground/60 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  disabled={uploading || !completedCrop || completedCrop.width === 0}
                  className="flex-1 py-3 rounded-2xl bg-brand-green text-white text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirm & Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
