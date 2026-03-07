export const applyWatermark = (imageData: string, watermarkText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      if (watermarkText) {
        const fontSize = Math.max(14, Math.floor(img.height / 30))
        const padding = 10
        const lineHeight = fontSize * 1.4
        
        ctx.font = "bold " + fontSize + "px sans-serif"
        ctx.textBaseline = "bottom"
        
        const lines = watermarkText.split(" | ")
        let maxWidth = 0
        for (let i = 0; i < lines.length; i++) {
          const measured = ctx.measureText(lines[i]).width
          if (measured > maxWidth) maxWidth = measured
        }
        
        const boxHeight = lines.length * lineHeight + padding
        const boxY = img.height - boxHeight - padding
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(padding, boxY, maxWidth + padding * 3, boxHeight)
        
        ctx.fillStyle = "#ffffff"
        for (let i = 0; i < lines.length; i++) {
          const y = img.height - padding - (lines.length - 1 - i) * lineHeight
          ctx.fillText(lines[i], padding * 2, y)
        }
      }
      
      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
    
    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }
    
    img.src = imageData
  })
}
