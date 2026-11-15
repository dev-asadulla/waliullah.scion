import { calculateCompressionMetrics } from './portfolioLogic';

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  originalSizeKb: number;
  savedPercent: number;
  mimeType: string;
}

export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  targetMaxBytes = 420 * 1024
): Promise<OptimizedImageResult> {
  const originalBytes = file.size;

  const imageBitmap = await loadImageElement(file);
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize image optimization canvas.');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  let mimeType = 'image/webp';
  let quality = 0.86;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  if (!dataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/jpeg';
    dataUrl = canvas.toDataURL(mimeType, quality);
  }

  while (estimateDataUrlBytes(dataUrl) > targetMaxBytes && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL(mimeType, quality);
  }

  const optimizedBytes = estimateDataUrlBytes(dataUrl);
  const { originalKb, sizeKb, savedPercent } = calculateCompressionMetrics(originalBytes, optimizedBytes);

  return {
    dataUrl,
    width,
    height,
    sizeKb,
    originalSizeKb: originalKb,
    savedPercent,
    mimeType,
  };
}

export async function optimizeLogoFile(
  file: File,
  maxDimension = 512,
  targetMaxBytes = 160 * 1024
): Promise<OptimizedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (SVG, PNG, WebP, or JPG).');
  }

  const isSvg =
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (isSvg) {
    if (file.size > 250 * 1024) {
      throw new Error('SVG logo must be 250 KB or smaller.');
    }
    const dataUrl = await readFileAsDataUrl(file);
    const dims = await decodeImageDimensions(dataUrl);
    const bytes = estimateDataUrlBytes(dataUrl);
    const { originalKb, sizeKb, savedPercent } = calculateCompressionMetrics(
      file.size,
      bytes
    );
    return {
      dataUrl,
      width: dims.width || 256,
      height: dims.height || 256,
      sizeKb,
      originalSizeKb: originalKb,
      savedPercent,
      mimeType: 'image/svg+xml',
    };
  }

  const originalBytes = file.size;
  const imageBitmap = await loadImageElement(file);
  const scale = Math.min(
    1,
    maxDimension / Math.max(imageBitmap.width, imageBitmap.height)
  );
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize logo optimization canvas.');
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  let mimeType = 'image/webp';
  let quality = 0.92;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  if (!dataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/png';
    dataUrl = canvas.toDataURL(mimeType);
  } else {
    while (estimateDataUrlBytes(dataUrl) > targetMaxBytes && quality > 0.45) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL(mimeType, quality);
    }
  }

  if (estimateDataUrlBytes(dataUrl) > 360 * 1024) {
    throw new Error('Logo image is too large even after optimization. Please choose a smaller asset.');
  }

  const optimizedBytes = estimateDataUrlBytes(dataUrl);
  const { originalKb, sizeKb, savedPercent } = calculateCompressionMetrics(
    originalBytes,
    optimizedBytes
  );

  return {
    dataUrl,
    width,
    height,
    sizeKb,
    originalSizeKb: originalKb,
    savedPercent,
    mimeType,
  };
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function decodeImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to decode selected image file.'));
    img.src = dataUrl;
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode selected image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

