// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const generateBtn = document.getElementById('generateBtn');
const steps = document.querySelectorAll('.step');
const originalImage = document.getElementById('originalImage');
const outlineImage = document.getElementById('outlineImage');
const detailedImage = document.getElementById('detailedImage');
const finalImage = document.getElementById('finalImage');

const downloadBtn1 = document.getElementById('downloadBtn1');
const downloadBtn2 = document.getElementById('downloadBtn2');
const downloadBtn3 = document.getElementById('downloadBtn3');
const downloadBtn4 = document.getElementById('downloadBtn4');

// Mouse glow effect
const mouseGlow = document.createElement('div');
mouseGlow.className = 'mouse-glow';
document.body.appendChild(mouseGlow);

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update mouse glow position
    mouseGlow.style.left = (mouseX - 100) + 'px';
    mouseGlow.style.top = (mouseY - 100) + 'px';
    mouseGlow.style.opacity = '1';
    
    // Parallax effect on step cards
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepCenterX = rect.left + rect.width / 2;
        const stepCenterY = rect.top + rect.height / 2;
        
        const angleX = (mouseY - stepCenterY) * 0.02;
        const angleY = (mouseX - stepCenterX) * 0.02;
        
        step.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
});

document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach((step) => {
        step.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Upload functionality
let uploadedImage = null;

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                originalImage.style.backgroundImage = `url(${e.target.result})`;
                generateBtn.disabled = false;
                generateBtn.textContent = 'San\'at yaratish';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert('Iltimos, rasm faylini tanlang!');
    }
}

// Image processing functions
function createCanvasFromImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return { canvas, ctx };
}

function getImageData(ctx, width, height) {
    return ctx.getImageData(0, 0, width, height);
}

function setImageData(ctx, imageData) {
    ctx.putImageData(imageData, 0, 0);
}

function grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
}

function invert(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
}

function applySketchEffect(img) {
    const { canvas, ctx } = createCanvasFromImage(img);
    const width = canvas.width;
    const height = canvas.height;
    
    let imageData = getImageData(ctx, width, height);
    
    const blurredCanvas = document.createElement('canvas');
    blurredCanvas.width = width;
    blurredCanvas.height = height;
    const blurredCtx = blurredCanvas.getContext('2d');
    blurredCtx.filter = 'blur(2px)';
    blurredCtx.drawImage(img, 0, 0);
    const blurredData = getImageData(blurredCtx, width, height);
    
    const data = imageData.data;
    const blurData = blurredData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const blurGray = blurData[i] * 0.299 + blurData[i + 1] * 0.587 + blurData[i + 2] * 0.114;
        let diff = gray - blurGray;
        diff = Math.max(0, Math.min(255, diff * 2 + 128));
        
        const red = Math.min(255, diff * 1.2 + 30);
        const green = Math.max(0, diff * 0.8 - 20);
        const blue = Math.max(0, diff * 0.6 - 40);
        
        data[i] = red;
        data[i + 1] = green;
        data[i + 2] = blue;
    }
    
    setImageData(ctx, imageData);
    return canvas.toDataURL();
}

function applyDetailedSketch(img) {
    const { canvas, ctx } = createCanvasFromImage(img);
    const width = canvas.width;
    const height = canvas.height;
    
    let imageData = getImageData(ctx, width, height);
    imageData = grayscale(imageData);
    
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        let gray = data[i] + noise;
        gray = Math.max(0, Math.min(255, gray));
        
        const red = Math.min(255, gray * 1.3 + 40);
        const green = Math.max(0, gray * 0.7 - 30);
        const blue = Math.max(0, gray * 0.5 - 50);
        
        data[i] = red;
        data[i + 1] = green;
        data[i + 2] = blue;
    }
    
    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 128) {
            data[i] = Math.min(255, 200 + Math.random() * 55);
            data[i + 1] = Math.max(0, 50 + Math.random() * 30);
            data[i + 2] = Math.max(0, 20 + Math.random() * 20);
        } else {
            data[i] = Math.max(0, 30 + Math.random() * 40);
            data[i + 1] = Math.max(0, 10 + Math.random() * 20);
            data[i + 2] = Math.max(0, 5 + Math.random() * 15);
        }
    }
    
    setImageData(ctx, imageData);
    return canvas.toDataURL();
}

function applyFinalArt(img) {
    const { canvas, ctx } = createCanvasFromImage(img);
    const width = canvas.width;
    const height = canvas.height;
    
    let imageData = getImageData(ctx, width, height);
    imageData = grayscale(imageData);
    
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];
        data[i] = Math.min(255, gray * 1.4 + 50);
        data[i + 1] = Math.max(0, gray * 0.6 - 40);
        data[i + 2] = Math.max(0, gray * 0.4 - 60);
    }
    
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            if (Math.random() > 0.93) {
                const index = (y * width + x) * 4;
                if (index < data.length) {
                    data[index] = Math.random() * 100 + 50;
                    data[index + 1] = Math.random() * 30;
                    data[index + 2] = Math.random() * 20;
                }
            }
        }
    }
    
    setImageData(ctx, imageData);
    return canvas.toDataURL();
}

// Generate art functionality
generateBtn.addEventListener('click', () => {
    if (!uploadedImage) return;
    
    generateBtn.disabled = true;
    generateBtn.textContent = 'Yaratilmoqda...';
    
    // Hide upload section with animation
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.classList.add('hide');
    
    steps.forEach(step => step.classList.remove('show'));
    downloadBtn1.disabled = true;
    downloadBtn2.disabled = true;
    downloadBtn3.disabled = true;
    downloadBtn4.disabled = true;
    
    const originalDataUrl = createCanvasFromImage(uploadedImage).canvas.toDataURL();
    const outlineDataUrl = applySketchEffect(uploadedImage);
    const detailedDataUrl = applyDetailedSketch(uploadedImage);
    const finalDataUrl = applyFinalArt(uploadedImage);
    
    setTimeout(() => {
        originalImage.style.backgroundImage = `url(${originalDataUrl})`;
        steps[0].classList.add('show');
        downloadBtn1.disabled = false;
    }, 500);
    
    setTimeout(() => {
        outlineImage.style.backgroundImage = `url(${outlineDataUrl})`;
        steps[1].classList.add('show');
        downloadBtn2.disabled = false;
    }, 1500);
    
    setTimeout(() => {
        detailedImage.style.backgroundImage = `url(${detailedDataUrl})`;
        steps[2].classList.add('show');
        downloadBtn3.disabled = false;
    }, 2500);
    
    setTimeout(() => {
        finalImage.style.backgroundImage = `url(${finalDataUrl})`;
        steps[3].classList.add('show');
        downloadBtn4.disabled = false;
        
        generateBtn.disabled = false;
        generateBtn.textContent = 'Yangi san\'at yaratish';
    }, 3500);
});

function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download button event listeners
downloadBtn1.addEventListener('click', () => {
    const dataUrl = originalImage.style.backgroundImage.replace('url("', '').replace('")', '');
    downloadImage(dataUrl, 'artai-asl-rasm.png');
});

downloadBtn2.addEventListener('click', () => {
    const dataUrl = outlineImage.style.backgroundImage.replace('url("', '').replace('")', '');
    downloadImage(dataUrl, 'artai-eskiz-konturi.png');
});

downloadBtn3.addEventListener('click', () => {
    const dataUrl = detailedImage.style.backgroundImage.replace('url("', '').replace('")', '');
    downloadImage(dataUrl, 'artai-batafsil-chizma.png');
});

downloadBtn4.addEventListener('click', () => {
    const dataUrl = finalImage.style.backgroundImage.replace('url("', '').replace('")', '');
    downloadImage(dataUrl, 'artai-yakuniy-illustrasiya.png');
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Rahmat! Sizning xabari yuborildi. Tez orada sizga javob beramiz.');
        contactForm.reset();
    });
}

// Initial animation
window.addEventListener('load', () => {
    setTimeout(() => {
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.classList.add('show');
            }, index * 200);
        });
    }, 1000);
});