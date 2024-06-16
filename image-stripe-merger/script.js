window.onload = function () {
    const dropZoneA = document.getElementById('dropZoneA');
    const dropZoneB = document.getElementById('dropZoneB');
    const imagePreviewA = document.getElementById('imagePreviewA');
    const imagePreviewB = document.getElementById('imagePreviewB');
    const inputFileA = document.getElementById('inputFileA');
    const inputFileB = document.getElementById('inputFileB');

    setupDropZone(dropZoneA, imagePreviewA, inputFileA, 'A');
    setupDropZone(dropZoneB, imagePreviewB, inputFileB, 'B');

    imgA.src = imagePreviewA.src;
    imgB.src = imagePreviewB.src;

    imgA.onload = function () {
        imgB.onload = function () {
            updatePreview();
        }
    }

    document.getElementById('stripeCount').addEventListener('input', updatePreview);
    document.getElementById('direction').addEventListener('change', updatePreview);
}

function setupDropZone(dropZone, imagePreview, inputFile, type) {
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('dragover');
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                dropZone.querySelector('span').style.display = 'none';
                if (type === 'A') {
                    imgA.src = e.target.result;
                } else {
                    imgB.src = e.target.result;
                }
                imgA.onload = imgB.onload = function () {
                    updatePreview();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    dropZone.addEventListener('click', () => {
        inputFile.click();
    });

    inputFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                dropZone.querySelector('span').style.display = 'none';
                if (type === 'A') {
                    imgA.src = e.target.result;
                } else {
                    imgB.src = e.target.result;
                }
                imgA.onload = imgB.onload = function () {
                    updatePreview();
                };
            };
            reader.readAsDataURL(file);
        }
    });
}

let imgA = new Image();
let imgB = new Image();

function updatePreview() {
    const stripeCount = parseInt(document.getElementById('stripeCount').value);
    const direction = document.getElementById('direction').value;

    if (!isNaN(stripeCount)) {
        processImages(imgA, imgB, stripeCount, direction);
    }
}

function processImages(imgA, imgB, stripeCount, direction) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = imgA.width;
    const height = imgA.height;

    canvas.width = width;
    canvas.height = height;

    const totalStripes = stripeCount + 1;
    let stripeWidth, remainingPixels;

    if (direction === 'vertical' || direction === 'diagonal') {
        stripeWidth = Math.floor(width / totalStripes);
        remainingPixels = width % totalStripes;
    } else {
        stripeWidth = Math.floor(height / totalStripes);
        remainingPixels = height % totalStripes;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (direction === 'vertical') {
        for (let i = 0; i < totalStripes; i++) {
            const x = i * stripeWidth + Math.min(i, remainingPixels);
            const currentStripeWidth = stripeWidth + (i < remainingPixels ? 1 : 0);
            const img = i % 2 === 0 ? imgA : imgB;
            ctx.drawImage(img, x, 0, currentStripeWidth, height, x, 0, currentStripeWidth, height);
        }
    } else if (direction === 'horizontal') {
        for (let i = 0; i < totalStripes; i++) {
            const y = i * stripeWidth + Math.min(i, remainingPixels);
            const currentStripeWidth = stripeWidth + (i < remainingPixels ? 1 : 0);
            const img = i % 2 === 0 ? imgA : imgB;
            ctx.drawImage(img, 0, y, width, currentStripeWidth, 0, y, width, currentStripeWidth);
        }
    } else if (direction === 'diagonal') {
        for (let i = 0; i < totalStripes; i++) {
            const img = i % 2 === 0 ? imgA : imgB;
            for (let x = 0; x < width; x += stripeWidth * 2) {
                const y = x * (height / width);
                const currentStripeWidth = stripeWidth + (i < remainingPixels ? 1 : 0);
                ctx.drawImage(img, x, y, currentStripeWidth, currentStripeWidth, x, y, currentStripeWidth, currentStripeWidth);
                if (x + currentStripeWidth < width && y + currentStripeWidth < height) {
                    ctx.drawImage(img, x + currentStripeWidth, y + currentStripeWidth, currentStripeWidth, currentStripeWidth, x + currentStripeWidth, y + currentStripeWidth, currentStripeWidth, currentStripeWidth);
                }
            }
        }
    }
}