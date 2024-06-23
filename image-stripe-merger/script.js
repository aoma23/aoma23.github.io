window.onload = function () {
    const dropZoneA = document.getElementById('dropZoneA');
    const dropZoneB = document.getElementById('dropZoneB');
    const imagePreviewA = document.getElementById('imagePreviewA');
    const imagePreviewB = document.getElementById('imagePreviewB');
    const inputFileA = document.getElementById('inputFileA');
    const inputFileB = document.getElementById('inputFileB');
    const angleInput = document.getElementById('angle');
    const verticalButton = document.getElementById('verticalButton');
    const horizontalButton = document.getElementById('horizontalButton');
    const diagonalButton = document.getElementById('diagonalButton');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');

    setupDropZone(dropZoneA, imagePreviewA, inputFileA, 'A');
    setupDropZone(dropZoneB, imagePreviewB, inputFileB, 'B');

    imgA.src = imagePreviewA.src;
    imgB.src = imagePreviewB.src;

    imgA.onload = function () {
        imgB.onload = function () {
            updatePreview();
        }
    }

    verticalButton.addEventListener('click', () => setAngleAndUpdatePreview(0));
    horizontalButton.addEventListener('click', () => setAngleAndUpdatePreview(90));
    diagonalButton.addEventListener('click', () => setAngleAndUpdatePreview(45));

    document.getElementById('stripeCount').addEventListener('input', updatePreview);
    angleInput.addEventListener('input', updatePreview);

    copyButton.addEventListener('click', copyToClipboard);
    downloadButton.addEventListener('click', downloadImage);

    enableCanvasDraggingAndScaling();
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
        handleFile(event.dataTransfer.files[0], imagePreview, type);
    });

    dropZone.addEventListener('click', () => {
        inputFile.click();
    });

    inputFile.addEventListener('change', (event) => {
        handleFile(event.target.files[0], imagePreview, type);
    });
}

function handleFile(file, imagePreview, type) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            document.querySelector(`#${type === 'A' ? 'dropZoneA' : 'dropZoneB'} span`).style.display = 'none';
            if (type === 'A') {
                imgA.src = e.target.result;
            } else {
                imgB.src = e.target.result;
            }
            imgA.onload = imgB.onload = updatePreview;
        };
        reader.readAsDataURL(file);
    }
}

function setAngleAndUpdatePreview(angle) {
    document.getElementById('angle').value = angle;
    updatePreview();
}

let imgA = new Image();
let imgB = new Image();
let offsets = [];
let scales = [];

function updatePreview() {
    const stripeCount = parseInt(document.getElementById('stripeCount').value);
    const angle = parseFloat(document.getElementById('angle').value);

    if (!isNaN(stripeCount)) {
        processImages(imgA, imgB, stripeCount, angle);
    }
}

function processImages(imgA, imgB, stripeCount, angle) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = imgA.width;
    const height = imgA.height;

    canvas.width = width;
    canvas.height = height;
    const adjustedAngle = adjustAngle(angle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= stripeCount; i++) {
        let img = i % 2 === 0 ? imgA : imgB;
        let offset = offsets[i] || { x: 0, y: 0 };
        let scale = scales[i] || 1;

        ctx.save();
        ctx.beginPath();

        const { x1, y1, x2, y2, x3, y3, x4, y4 } = calculateStripeCoordinates(i, stripeCount, width, height, adjustedAngle);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);

        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, offset.x, offset.y, width * scale, height * scale);
        ctx.restore();
    }
}

function adjustAngle(angle) {
    angle = angle % 360;
    if (angle > 180) {
        return angle - 360;
    } else if (angle < -180) {
        return angle + 360;
    }
    return angle;
}

function calculateStripeCoordinates(i, stripeCount, width, height, angle) {
    const radians = angle * Math.PI / 180;
    const stripeWidth = (width + height * Math.tan(Math.abs(radians))) / (stripeCount + 1);
    let x1, y1, x2, y2, x3, y3, x4, y4;

    if (angle >= 0 && angle <= 90) {
        x1 = i * stripeWidth;
        y1 = 0;
        x2 = (i + 1) * stripeWidth;
        y2 = 0;
        x3 = x2 - height * Math.tan(radians);
        y3 = height;
        x4 = x1 - height * Math.tan(radians);
        y4 = height;
    } else if (angle < 0 && angle >= -90) {
        x1 = width - (i * stripeWidth);
        y1 = 0;
        x2 = width - ((i + 1) * stripeWidth);
        y2 = 0;
        x3 = x2 + height * Math.tan(Math.abs(radians));
        y3 = height;
        x4 = x1 + height * Math.tan(Math.abs(radians));
        y4 = height;
    } else if (angle < -90 && angle >= -180) {
        const newAngle = 180 + angle;
        const newRadians = newAngle * Math.PI / 180;
        x1 = i * stripeWidth;
        y1 = 0;
        x2 = (i + 1) * stripeWidth;
        y2 = 0;
        x3 = x2 - height * Math.tan(newRadians);
        y3 = height;
        x4 = x1 - height * Math.tan(newRadians);
        y4 = height;
    } else if (angle > 90 && angle <= 180) {
        const newAngle = -180 + angle;
        const newRadians = newAngle * Math.PI / 180;
        x1 = width - (i * stripeWidth);
        y1 = 0;
        x2 = width - ((i + 1) * stripeWidth);
        y2 = 0;
        x3 = x2 + height * Math.tan(Math.abs(newRadians));
        y3 = height;
        x4 = x1 + height * Math.tan(Math.abs(newRadians));
        y4 = height;
    }

    return { x1, y1, x2, y2, x3, y3, x4, y4 };
}

function enableCanvasDraggingAndScaling() {
    const canvas = document.getElementById('canvas');
    let isDragging = false;
    let startX, startY, initialX, initialY, stripeIndex;

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        const rect = canvas.getBoundingClientRect();
        const scaleFactor = canvas.width / rect.width;
        stripeIndex = getStripeIndex((event.clientX - rect.left) * scaleFactor, (event.clientY - rect.top) * scaleFactor);
        if (stripeIndex !== null) {
            initialX = offsets[stripeIndex]?.x || 0;
            initialY = offsets[stripeIndex]?.y || 0;
        }
        event.preventDefault();
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging && stripeIndex !== null) {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            offsets[stripeIndex] = { x: initialX + dx, y: initialY + dy };
            updatePreview();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleFactor = canvas.width / rect.width;
        stripeIndex = getStripeIndex((event.clientX - rect.left) * scaleFactor, (event.clientY - rect.top) * scaleFactor);
        if (stripeIndex !== null) {
            const scale = scales[stripeIndex] || 1;
            const newScale = event.deltaY > 0 ? scale * 0.97 : scale * 1.03;  // スケール変更を緩やかにするための調整
            scales[stripeIndex] = newScale;
            updatePreview();
        }
    });
}

function getStripeIndex(x, y) {
    const stripeCount = parseInt(document.getElementById('stripeCount').value);
    const angle = parseFloat(document.getElementById('angle').value);

    const radians = angle * Math.PI / 180;
    const stripeWidth = (imgA.width + imgA.height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

    for (let i = 0; i <= stripeCount; i++) {
        const { x1, y1, x2, y2, x3, y3, x4, y4 } = calculateStripeCoordinates(i, stripeCount, imgA.width, imgA.height, angle);
        if (isPointInPolygon([x1, y1, x2, y2, x3, y3, x4, y4], x, y)) {
            return i;
        }
    }

    return null;
}

function isPointInPolygon(points, x, y) {
    let inside = false;
    for (let i = 0, j = points.length / 2 - 1; i < points.length / 2; j = i++) {
        const xi = points[i * 2], yi = points[i * 2 + 1];
        const xj = points[j * 2], yj = points[j * 2 + 1];

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function copyToClipboard() {
    const canvas = document.getElementById('canvas');
    canvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
    });
}

function downloadImage() {
    const canvas = document.getElementById('canvas');
    const originalWidth = imgA.width;
    const originalHeight = imgA.height;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;

    const stripeCount = parseInt(document.getElementById('stripeCount').value);
    const angle = parseFloat(document.getElementById('angle').value);

    processImages(imgA, imgB, stripeCount, angle, tempCtx);

    const link = document.createElement('a');
    link.download = 'merged_image.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}