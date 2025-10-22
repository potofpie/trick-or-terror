// CRT screen effect functions for retro visual aesthetic

export function applyCRTGlow(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number = 0.5): void {
  if (intensity === 0) return;
  
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = canvas.width;
  glowCanvas.height = canvas.height;
  const glowCtx = glowCanvas.getContext("2d")!;

  glowCtx.filter = "blur(6px)";
  glowCtx.drawImage(canvas, 0, 0);

  // Create radial gradient mask for center-to-edge glow
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext("2d")!;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  const gradient = maskCtx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, maxRadius
  );
  gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  gradient.addColorStop(0.6, `rgba(255, 255, 255, ${intensity * 0.5})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
  
  maskCtx.fillStyle = gradient;
  maskCtx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply glow with radial mask
  glowCtx.globalCompositeOperation = "destination-in";
  glowCtx.drawImage(maskCanvas, 0, 0);
  
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 1;
  ctx.drawImage(glowCanvas, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export function drawScanlineOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

export function drawVignette(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number = 1.0): void {
  const grad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width / 4,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.2
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${intensity})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function applyRGBSeparation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  // Save the current canvas state
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(canvas, 0, 0);
  
  // Apply RGB color separation for CRT chromatic aberration effect
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.4;
  
  // Red channel offset
  ctx.filter = "blur(0.5px) saturate(1.2)";
  ctx.drawImage(tempCanvas, 1, 0);
  
  // Blue channel offset
  ctx.drawImage(tempCanvas, -1, 0);
  
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export interface CRTEffectOptions {
  enableScanlines?: boolean;
  vignetteIntensity?: number;
  glowIntensity?: number;
  enableRGBSeparation?: boolean;
}

export function applyFisheyeEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number = 0.5): void {
  if (intensity === 0) return;
  
  // Create temporary canvas with current frame
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(canvas, 0, 0);
  
  const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
  const outputData = ctx.createImageData(canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  // Barrel distortion coefficient
  const k = intensity * 0.5; // Scale intensity for moderate effect
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Normalize coordinates to -1 to 1
      const nx = (x - centerX) / maxRadius;
      const ny = (y - centerY) / maxRadius;
      
      // Calculate radial distance
      const r = Math.sqrt(nx * nx + ny * ny);
      
      // Apply barrel distortion
      const distortion = 1 + k * r * r;
      const sourceX = centerX + (nx * maxRadius * distortion);
      const sourceY = centerY + (ny * maxRadius * distortion);
      
      // Bounds check and sample
      if (sourceX >= 0 && sourceX < canvas.width - 1 && sourceY >= 0 && sourceY < canvas.height - 1) {
        // Bilinear interpolation for smoother result
        const x0 = Math.floor(sourceX);
        const x1 = x0 + 1;
        const y0 = Math.floor(sourceY);
        const y1 = y0 + 1;
        
        const fx = sourceX - x0;
        const fy = sourceY - y0;
        
        const idx00 = (y0 * canvas.width + x0) * 4;
        const idx10 = (y0 * canvas.width + x1) * 4;
        const idx01 = (y1 * canvas.width + x0) * 4;
        const idx11 = (y1 * canvas.width + x1) * 4;
        
        const outputIdx = (y * canvas.width + x) * 4;
        
        // Interpolate each color channel
        for (let c = 0; c < 4; c++) {
          const c00 = imageData.data[idx00 + c];
          const c10 = imageData.data[idx10 + c];
          const c01 = imageData.data[idx01 + c];
          const c11 = imageData.data[idx11 + c];
          
          const c0 = c00 * (1 - fx) + c10 * fx;
          const c1 = c01 * (1 - fx) + c11 * fx;
          outputData.data[outputIdx + c] = c0 * (1 - fy) + c1 * fy;
        }
      } else {
        // Out of bounds - use black
        const outputIdx = (y * canvas.width + x) * 4;
        outputData.data[outputIdx] = 0;
        outputData.data[outputIdx + 1] = 0;
        outputData.data[outputIdx + 2] = 0;
        outputData.data[outputIdx + 3] = 255;
      }
    }
  }
  
  ctx.putImageData(outputData, 0, 0);
}

export function applyCRTEffect(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement,
  options: CRTEffectOptions = {}
): void {
  const { enableScanlines = true, vignetteIntensity = 1.0, glowIntensity = 0.5, enableRGBSeparation = true } = options;
  
  if (enableRGBSeparation) {
    applyRGBSeparation(ctx, canvas);
  }
  applyCRTGlow(ctx, canvas, glowIntensity);
  if (enableScanlines) {
    drawScanlineOverlay(ctx, canvas);
  }
  drawVignette(ctx, canvas, vignetteIntensity);
}

