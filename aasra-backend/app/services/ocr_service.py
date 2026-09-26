import logging
import os
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

logger = logging.getLogger(__name__)

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess image with grayscale and thresholding for better OCR accuracy."""
    # Convert to grayscale
    gray = image.convert("L")
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(gray)
    contrasted = enhancer.enhance(2.0)
    
    # Apply simple binary thresholding (pixel > 140 -> 255, else 0)
    threshold = 140
    table = [0 if i < threshold else 255 for i in range(256)]
    binarized = contrasted.point(table, "1")
    return binarized


def extract_text_from_file(file_path: str) -> str:
    """Extract text from an uploaded image or document file using OCR.
    
    Gracefully handles missing Tesseract binaries or unreadable files.
    """
    if not os.path.exists(file_path):
        logger.warning(f"File not found for OCR: {file_path}")
        return ""

    _, ext = os.path.splitext(file_path.lower())

    if ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
        try:
            with Image.open(file_path) as img:
                processed = preprocess_image(img)
                text = pytesseract.image_to_string(processed)
                return text.strip()
        except pytesseract.TesseractNotFoundError:
            logger.warning("Tesseract is not installed or not in PATH. OCR skipped.")
            return ""
        except Exception as e:
            logger.error(f"Error during OCR extraction on {file_path}: {e}")
            return ""

    elif ext == ".pdf":
        # Basic text or byte scan for PDF
        try:
            # Try reading embedded ASCII text streams if present
            with open(file_path, "rb") as f:
                content = f.read().decode("latin1", errors="ignore")
                # Basic string filtering of PDF streams
                words = [w for w in content.split() if len(w) > 3 and w.isprintable()]
                return " ".join(words[:200])
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            return ""

    return ""
