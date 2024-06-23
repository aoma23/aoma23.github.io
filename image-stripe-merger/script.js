window.onload = function () {
    const dropZoneA = document.getElementById('dropZoneA');
    const dropZoneB = document.getElementById('dropZoneB');
    const imagePreviewA = document.getElementById('imagePreviewA');
    const imagePreviewB = document.getElementById('imagePreviewB');
    const inputFileA = document.getElementById('inputFileA');
    const inputFileB = document.getElementById('inputFileB');
    const angleInput = document.getElementById('angle');
    const directionSelect = document.getElementById('direction');
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

    copyButton.addEventListener('click', copyToClipboard);
    downloadButton.addEventListener('click', downloadImage);

    enableCanvasDragging();
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
let offsets = [];

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
    angle = angle % 360;
    if (angle > 180) {
        angle = angle - 360;
    } else if (angle < -180) {
        angle = angle + 360;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (direction === 'diagonal') {

        for (let i = 0; i <= stripeCount; i++) {
            let img = i % 2 === 0 ? imgA : imgB;
            let offset = offsets[i] || { x: 0, y: 0 };
            ctx.save();
            ctx.beginPath();

            let stripeWidth, radians, x1, y1, x2, y2, x3, y3, x4, y4;

            if (angle >= 0 && angle <= 90) {
                radians = angle * Math.PI / 180;
                stripeWidth = (width + height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

                x1 = i * stripeWidth;
                y1 = 0;
                x2 = (i + 1) * stripeWidth;
                y2 = 0;
                x3 = x2 - height * Math.tan(radians);
                y3 = height;
                x4 = x1 - height * Math.tan(radians);
                y4 = height;
            } else if (angle < 0 && angle >= -90) {
                img = i % 2 === 1 ? imgA : imgB;
                offset = offsets[i] || { x: 0, y: 0 };
                radians = angle * Math.PI / 180;
                stripeWidth = (width + height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

                x1 = width - (i * stripeWidth);
                y1 = 0;
                x2 = width - ((i + 1) * stripeWidth);
                y2 = 0;
                x3 = x2 + height * Math.tan(Math.abs(radians));
                y3 = height;
                x4 = x1 + height * Math.tan(Math.abs(radians));
                y4 = height;
            } else if (angle < -90 && angle >= -180) {
                let new_angle = 180 + angle;
                img = i % 2 === 1 ? imgA : imgB;
                offset = offsets[i] || { x: 0, y: 0 };
                radians = new_angle * Math.PI / 180;
                stripeWidth = (width + height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

                x1 = i * stripeWidth;
                y1 = 0;
                x2 = (i + 1) * stripeWidth;
                y2 = 0;
                x3 = x2 - height * Math.tan(radians);
                y3 = height;
                x4 = x1 - height * Math.tan(radians);
                y4 = height;
            } else if (angle > 90 && angle <= 180) {
                let new_angle = -180 + angle;
                radians = new_angle * Math.PI / 180;
                stripeWidth = (width + height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

                x1 = width - (i * stripeWidth);
                y1 = 0;
                x2 = width - ((i + 1) * stripeWidth);
                y2 = 0;
                x3 = x2 + height * Math.tan(Math.abs(radians));
                y3 = height;
                x4 = x1 + height * Math.tan(Math.abs(radians));
                y4 = height;
            }

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);

            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, offset.x, offset.y, width, height);
            ctx.restore();
        }
    }
}

function enableCanvasDragging() {
    const canvas = document.getElementById('canvas');
    let isDragging = false;
    let startX, startY, initialX, initialY, stripeIndex;

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        stripeIndex = getStripeIndex(event.clientX, event.clientY);
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
}

function getStripeIndex(x, y) {
    const canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    const stripeCount = parseInt(document.getElementById('stripeCount').value);
    const direction = document.getElementById('direction').value;
    const angle = parseFloat(document.getElementById('angle').value);

    if (direction === 'diagonal') {
        const radians = angle * Math.PI / 180;
        const stripeWidth = (canvas.width + canvas.height * Math.tan(Math.abs(radians))) / (stripeCount + 1);

        for (let i = 0; i <= stripeCount; i++) {
            let x1, y1, x2, y2, x3, y3, x4, y4;

            if (angle >= 0 && angle <= 90) {
                x1 = i * stripeWidth;
                y1 = 0;
                x2 = (i + 1) * stripeWidth;
                y2 = 0;
                x3 = x2 - canvas.height * Math.tan(radians);
                y3 = canvas.height;
                x4 = x1 - canvas.height * Math.tan(radians);
                y4 = canvas.height;
            } else if (angle < 0 && angle >= -90) {
                x1 = canvas.width - (i * stripeWidth);
                y1 = 0;
                x2 = canvas.width - ((i + 1) * stripeWidth);
                y2 = 0;
                x3 = x2 + canvas.height * Math.tan(Math.abs(radians));
                y3 = canvas.height;
                x4 = x1 + canvas.height * Math.tan(Math.abs(radians));
                y4 = canvas.height;
            } else if (angle < -90 && angle >= -180) {
                let new_angle = 180 + angle;
                const new_radians = new_angle * Math.PI / 180;
                x1 = i * stripeWidth;
                y1 = 0;
                x2 = (i + 1) * stripeWidth;
                y2 = 0;
                x3 = x2 - canvas.height * Math.tan(new_radians);
                y3 = canvas.height;
                x4 = x1 - canvas.height * Math.tan(new_radians);
                y4 = canvas.height;
            } else if (angle > 90 && angle <= 180) {
                let new_angle = -180 + angle;
                const new_radians = new_angle * Math.PI / 180;
                x1 = canvas.width - (i * stripeWidth);
                y1 = 0;
                x2 = canvas.width - ((i + 1) * stripeWidth);
                y2 = 0;
                x3 = x2 + canvas.height * Math.tan(Math.abs(new_radians));
                y3 = canvas.height;
                x4 = x1 + canvas.height * Math.tan(Math.abs(new_radians));
                y4 = canvas.height;
            }

            if (isPointInPolygon([x1, y1, x2, y2, x3, y3, x4, y4], canvasX, canvasY)) {
                return i;
            }
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
    const link = document.createElement('a');
    link.download = 'merged_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}