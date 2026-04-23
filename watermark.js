// Run this separately or integrate into popup.js
async function addWatermark(imageBase64, portalName) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.font = `${Math.floor(img.width / 15)}px Arial`;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.rotate(-0.2);
      ctx.fillText(`FOR ${portalName} USE ONLY`, 50, img.height / 2);
      ctx.rotate(0.2);
      resolve(canvas.toDataURL());
    };
    img.src = imageBase64;
  });
}