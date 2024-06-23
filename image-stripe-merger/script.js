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
    angle = angle % 360;
    if (angle > 180) {
        angle = angle - 360;
    }else if(angle < -180) {
        angle = angle + 360;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (direction === 'diagonal') {

        for (let i = 0; i <= stripeCount; i++) {
            let img = i % 2 === 0 ? imgA : imgB;
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

            ctx.drawImage(img, 0, 0, width, height);
            ctx.restore();
        }
    }
}