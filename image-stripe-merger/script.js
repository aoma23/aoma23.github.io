window.onload = function () {
    const dropZoneA = document.getElementById('dropZoneA');
    const dropZoneB = document.getElementById('dropZoneB');
    const imagePreviewA = document.getElementById('imagePreviewA');
    const imagePreviewB = document.getElementById('imagePreviewB');
    const inputFileA = document.getElementById('inputFileA');
    const inputFileB = document.getElementById('inputFileB');
    const angleInput = document.getElementById('angle');
    const directionSelect = document.getElementById('direction');

    setupDropZone(dropZoneA, imagePreviewA, inputFileA, 'A');
    setupDropZone(dropZoneB, imagePreviewB, inputFileB, 'B');

    imgA.src = imagePreviewA.src;
    imgB.src = imagePreviewB.src;

    imgA.onload = function () {
        imgB.onload = function () {
            updatePreview();
        }
    }

    directionSelect.addEventListener('change', function () {
        if (directionSelect.value === 'diagonal') {
            angleInput.style.display = 'inline';
        } else {
            angleInput.style.display = 'none';
        }
        updatePreview();
    });

    document.getElementById('stripeCount').addEventListener('input', updatePreview);
    angleInput.addEventListener('input', updatePreview);
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
    const angle = parseFloat(document.getElementById('angle').value);

    if (!isNaN(stripeCount)) {
        processImages(imgA, imgB, stripeCount, direction, angle);
    }
}

function processImages(imgA, imgB, stripeCount, direction, angle) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = imgA.width;
    const height = imgA.height;

    canvas.width = width;
    canvas.height = height;

    const totalStripes = stripeCount + 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (direction === 'vertical') {
        const stripeWidth = Math.floor(width / totalStripes);
        const remainingPixels = width % totalStripes;
        for (let i = 0; i < totalStripes; i++) {
            const x = i * stripeWidth + Math.min(i, remainingPixels);
            const currentStripeWidth = stripeWidth + (i < remainingPixels ? 1 : 0);
            const img = i % 2 === 0 ? imgA : imgB;
            ctx.drawImage(img, x, 0, currentStripeWidth, height, x, 0, currentStripeWidth, height);
        }
    } else if (direction === 'horizontal') {
        const stripeWidth = Math.floor(height / totalStripes);
        const remainingPixels = height % totalStripes;
        for (let i = 0; i < totalStripes; i++) {
            const y = i * stripeWidth + Math.min(i, remainingPixels);
            const currentStripeWidth = stripeWidth + (i < remainingPixels ? 1 : 0);
            const img = i % 2 === 0 ? imgA : imgB;
            ctx.drawImage(img, 0, y, width, currentStripeWidth, 0, y, width, currentStripeWidth);
        }
    } else if (direction === 'diagonal') {
        const stripeWidth = Math.sqrt(width * width + height * height) / totalStripes;
        const radians = angle * Math.PI / 180;

        for (let i = 0; i < totalStripes; i++) {
            const img = i % 2 === 0 ? imgA : imgB;
            ctx.save();
            ctx.beginPath();

            // Calculate the four corners of the stripe
            const x1 = i * stripeWidth * Math.cos(radians);
            const y1 = i * stripeWidth * Math.sin(radians);
            const x2 = x1 + stripeWidth * Math.cos(radians);
            const y2 = y1 + stripeWidth * Math.sin(radians);
            const x3 = x2 - height * Math.sin(radians);
            const y3 = y2 + height * Math.cos(radians);
            const x4 = x1 - height * Math.sin(radians);
            const y4 = y1 + height * Math.cos(radians);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);

            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0, width, height);
            ctx.restore();
        }
    }
}