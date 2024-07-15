const createCircularImage = (imgSrc, size = 60) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0, size, size);

            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imgSrc;
    });
}

export {createCircularImage}