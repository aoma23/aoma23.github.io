function mergeImages() {
    const fileA = document.getElementById('imageA').files[0];
    const fileB = document.getElementById('imageB').files[0];
    const stripeWidth = parseInt(document.getElementById('stripeWidth').value);
    const direction = document.getElementById('direction').value;

    if (!fileA || !fileB || isNaN(stripeWidth)) {
        alert('Please select two images and specify the stripe width.');
        return;
    }

    const imgA = new Image();
    const imgB = new Image();
    const readerA = new FileReader();
    const readerB = new FileReader();

    readerA.onload = function (event) {
        imgA.src = event.target.result;
        if (imgB.src) {
            processImages(imgA, imgB, stripeWidth, direction);
        }
    };

    readerB.onload = function (event) {
        imgB.src = event.target.result;
        if (imgA.src) {
            processImages(imgA, imgB, stripeWidth, direction);
        }
    };

    readerA.readAsDataURL(fileA);
    readerB.readAsDataURL(fileB);
}

function processImages(imgA, imgB, stripeWidth, direction) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = imgA.width;
    const height = imgA.height;

    canvas.width = width;
    canvas.height = height;

    if (direction === 'vertical') {
        for (let x = 0; x < width; x += stripeWidth * 2) {
            ctx.drawImage(imgA, x, 0, stripeWidth, height, x, 0, stripeWidth, height);
            ctx.drawImage(imgB, x + stripeWidth, 0, stripeWidth, height, x + stripeWidth, 0, stripeWidth, height);
        }
    } else if (direction === 'horizontal') {
        for (let y = 0; y < height; y += stripeWidth * 2) {
            ctx.drawImage(imgA, 0, y, width, stripeWidth, 0, y, width, stripeWidth);
            ctx.drawImage(imgB, 0, y + stripeWidth, width, stripeWidth, 0, y + stripeWidth, width, stripeWidth);
        }
    } else if (direction === 'diagonal') {
        for (let i = 0; i < width + height; i += stripeWidth * 2) {
            for (let x = Math.max(0, i - height); x < Math.min(width, i); x += stripeWidth * 2) {
                const y = i - x;
                ctx.drawImage(imgA, x, y, stripeWidth, stripeWidth, x, y, stripeWidth, stripeWidth);
                if (x + stripeWidth < width && y + stripeWidth < height) {
                    ctx.drawImage(imgB, x + stripeWidth, y + stripeWidth, stripeWidth, stripeWidth, x + stripeWidth, y + stripeWidth, stripeWidth, stripeWidth);
                }
            }
        }
    }
}