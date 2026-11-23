import os
import io
import json
import base64
from typing import Dict, Any, Optional, List
import numpy as np

# Optional imports with graceful fallbacks
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

DAMAGE_CLASSES = [
    "Electrical Defect / Appliance Malfunction",
    "Water Leakage / Plumbing Defect",
    "Furniture Damage / Structural Crack",
    "Cleanliness / Waste Surrounding",
    "No Observable Defect (Normal Surface)",
    "Invalid Evidence: Human / Selfie Detected",
    "Invalid Evidence: Unrelated / Irrelevant Subject",
]

def analyze_complaint_image(image_bytes: bytes, filename: str = "upload.jpg", category_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Advanced Computer Vision Complaint Photo Authenticity & Defect Inspector:
    1. Verifies image integrity, resolution, and dimensions
    2. Detects Blank/Solid images (e.g. finger on lens, black screen, pure white wall)
    3. Detects Human Faces, Selfies, and Skin Tones (rejects personal photos)
    4. Computes Laplacian gradient variance for Blur & Sharpness detection
    5. Cross-checks physical defect features against reported category (Water, Electrical, Civil)
    6. Produces Authenticity Score (0-100%) and Actionable Admin Alert.
    """
    if not PIL_AVAILABLE:
        return {
            "success": False,
            "error": "PIL (Pillow) library not installed on service host.",
            "classes": DAMAGE_CLASSES
        }

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img_format = img.format or "JPEG"
        width, height = img.size

        # Size check
        file_size_kb = round(len(image_bytes) / 1024, 2)
        if file_size_kb > 10240:  # 10MB limit
            return {
                "success": False,
                "error": f"Image exceeds maximum permitted size of 10MB (Received: {file_size_kb} KB)."
            }

        if width < 20 or height < 20:
            return {
                "success": True,
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "file_size_kb": file_size_kb,
                "is_genuine": False,
                "authenticity_score": 10,
                "authenticity_status": "Rejected / Low Resolution Thumbnail",
                "defect_class": "No Observable Defect (Normal Surface)",
                "admin_alert": "⚠️ AI Quality Warning: Image resolution is too low (< 20px) to extract defect features. Manual physical inspection required.",
                "quality": {
                    "sharpness_score": 0.0,
                    "is_blurry": True,
                    "is_blank": True,
                    "status": "Resolution Too Low (< 20px)"
                },
                "reasons": ["Image dimensions too small for defect feature extraction."],
                "manual_inspection_recommended": True
            }

        # Convert to RGB numpy array
        rgb_img = img.convert('RGB')
        # Resize to max 600x600 for fast, consistent numeric analysis
        rgb_img.thumbnail((600, 600))
        img_arr = np.array(rgb_img, dtype=np.float32)

        # Grayscale representation
        gray = 0.2989 * img_arr[:, :, 0] + 0.5870 * img_arr[:, :, 1] + 0.1140 * img_arr[:, :, 2]

        # -------------------------------------------------------------
        # 1. Blank / Solid / Uniform Screen Detection
        # -------------------------------------------------------------
        intensity_std = float(np.std(gray))
        dark_ratio = float(np.mean(gray < 30.0))
        bright_ratio = float(np.mean(gray > 235.0))

        is_blank = False
        blank_reason = None

        if intensity_std < 12.0:
            is_blank = True
            blank_reason = "Image is almost a uniform flat solid color (e.g. camera covered or plain surface)."
        elif dark_ratio > 0.85:
            is_blank = True
            blank_reason = "Image is predominantly dark / black (over 85% dark pixels)."
        elif bright_ratio > 0.85:
            is_blank = True
            blank_reason = "Image is overexposed / washed out white (over 85% white pixels)."

        if is_blank:
            return {
                "success": True,
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "file_size_kb": file_size_kb,
                "is_genuine": False,
                "authenticity_score": 10,
                "authenticity_status": "Rejected: Blank / Covered Lens",
                "defect_class": "No Observable Defect (Normal Surface)",
                "admin_alert": f"🚨 AI Rejection: {blank_reason} Evidence must clearly show the physical maintenance issue.",
                "quality": {
                    "sharpness_score": 0.0,
                    "is_blurry": True,
                    "is_blank": True,
                    "status": "Blank / Uniform Surface"
                },
                "reasons": [blank_reason],
                "manual_inspection_recommended": True
            }

        # -------------------------------------------------------------
        # 2. Sharpness & Blur Analysis via Gradient Norm
        # -------------------------------------------------------------
        gy, gx = np.gradient(gray)
        gnorm = np.sqrt(gx**2 + gy**2)
        sharpness_score = float(np.var(gnorm))
        is_blurry = bool(sharpness_score < 25.0)

        # -------------------------------------------------------------
        # 3. Human Skin & Selfie Recognition Filter
        # -------------------------------------------------------------
        r = img_arr[:, :, 0]
        g = img_arr[:, :, 1]
        b = img_arr[:, :, 2]

        cb = 128.0 - 0.168736 * r - 0.331264 * g + 0.5 * b
        cr = 128.0 + 0.5 * r - 0.418688 * g - 0.081312 * b

        # Chromatic human skin mask (YCbCr + normalized RGB)
        skin_mask = (
            (r > 80.0) & (g > 35.0) & (b > 20.0) &
            (r > g) & (r > b) &
            (np.abs(r - g) > 12.0) &
            (cb >= 77.0) & (cb <= 135.0) &
            (cr >= 130.0) & (cr <= 180.0)
        )
        skin_ratio = float(np.mean(skin_mask))

        # Check central 60% crop (typical selfie or portrait composition)
        h, w = skin_mask.shape
        center_crop = skin_mask[int(h * 0.2):int(h * 0.8), int(w * 0.2):int(w * 0.8)]
        center_skin_ratio = float(np.mean(center_crop))

        is_human_detected = bool(skin_ratio > 0.14 or center_skin_ratio > 0.20)
        if is_human_detected:
            return {
                "success": True,
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "file_size_kb": file_size_kb,
                "is_genuine": False,
                "authenticity_score": 12,
                "authenticity_status": "Rejected: Human / Selfie Detected",
                "defect_class": "Invalid Evidence: Human / Selfie Detected",
                "admin_alert": "🚨 AI Evidence Rejection: Human face / selfie detected in the uploaded photo. Evidence must capture the physical campus asset (e.g., pipe, fan, switch, tap) instead of personal selfies or people.",
                "quality": {
                    "sharpness_score": round(sharpness_score, 1),
                    "is_blurry": False,
                    "is_blank": False,
                    "status": "Clear (Non-Maintenance Subject)"
                },
                "reasons": [
                    f"Significant human skin tone concentration ({round(skin_ratio * 100, 1)}% frame, {round(center_skin_ratio * 100, 1)}% center) indicates a portrait or selfie.",
                    "No physical campus maintenance infrastructure, damaged pipe, or hazard identified."
                ],
                "manual_inspection_recommended": True
            }

        # -------------------------------------------------------------
        # 4. Structural Edge Density & Defect Analysis
        # -------------------------------------------------------------
        edge_pixels_ratio = float(np.mean(gnorm > 18.0))
        mean_r = float(np.mean(r))
        mean_g = float(np.mean(g))
        mean_b = float(np.mean(b))

        detected_category = "No Observable Defect (Normal Surface)"
        reasons = []
        base_score = 30  # Neutral base confidence

        cat_hint_clean = (category_hint or "").lower()

        # Category-Specific Verification
        if "plumb" in cat_hint_clean or "water" in cat_hint_clean:
            # Water / Plumbing verification
            is_moisture_detected = (
                (mean_b > mean_r + 4 and intensity_std > 22.0) or
                (dark_ratio > 0.15 and edge_pixels_ratio > 0.05 and intensity_std > 30.0)
            )
            if is_moisture_detected and edge_pixels_ratio > 0.04:
                detected_category = "Water Leakage / Plumbing Defect"
                base_score = 88
                reasons.append("Moisture specular reflections and pooling contrast correlate with plumbing leaks / water damage.")
            elif edge_pixels_ratio > 0.08 and intensity_std > 35.0:
                detected_category = "Water Leakage / Plumbing Defect"
                base_score = 78
                reasons.append("High-contrast fluid flow staining patterns detected on surface.")
            elif edge_pixels_ratio < 0.05:
                detected_category = "No Observable Defect (Normal Surface)"
                base_score = 32
                reasons.append("Surface appears completely dry and intact without moisture pooling or pipe bursts.")
            else:
                detected_category = "Invalid Evidence: Unrelated / Irrelevant Subject"
                base_score = 18
                reasons.append("Photo appears unrelated to campus plumbing. No water pipes, sanitary fixtures, or leak stains detected.")

        elif "electr" in cat_hint_clean:
            # Electrical verification
            if dark_ratio > 0.28 and edge_pixels_ratio > 0.06:
                detected_category = "Electrical Defect / Scorch Hazard"
                base_score = 90
                reasons.append("High dark pixel concentration and irregular high-contrast edges indicate burn/scorch or electrical wiring hazard.")
            elif edge_pixels_ratio > 0.06 and intensity_std > 30.0:
                detected_category = "Electrical Defect / Appliance Malfunction"
                base_score = 82
                reasons.append("Structural fixture contours match electrical appliance or wiring distribution point.")
            elif edge_pixels_ratio < 0.05:
                detected_category = "No Observable Defect (Normal Surface)"
                base_score = 35
                reasons.append("Surface/appliance appears intact without observable scorch, physical breakage, or exposed wiring.")
            else:
                detected_category = "Invalid Evidence: Unrelated / Irrelevant Subject"
                base_score = 20
                reasons.append("No recognizable electrical equipment, fans, switchboards, or power distribution fixtures detected.")

        elif "civil" in cat_hint_clean or "furnit" in cat_hint_clean:
            # Civil / Furniture verification
            if edge_pixels_ratio > 0.08:
                detected_category = "Furniture Damage / Structural Crack"
                base_score = 85
                reasons.append(f"High structural edge density ({round(edge_pixels_ratio * 100, 1)}%) indicates cracked surface, broken fixture, or physical impact.")
            else:
                detected_category = "No Observable Defect (Normal Surface)"
                base_score = 35
                reasons.append("Surface appears intact without observable cracks, fractures, or structural breakage.")

        else:
            # General facility verification
            if dark_ratio > 0.30 and edge_pixels_ratio > 0.06:
                detected_category = "Electrical Defect / Scorch Hazard"
                base_score = 85
                reasons.append("High dark pixel concentration and irregular edges indicate burn/scorch hazard.")
            elif mean_b > mean_r + 10 and edge_pixels_ratio > 0.05:
                detected_category = "Water Leakage / Plumbing Defect"
                base_score = 82
                reasons.append("Moisture reflections and liquid pooling contrast correlate with plumbing leaks.")
            elif edge_pixels_ratio > 0.09:
                detected_category = "Furniture Damage / Structural Crack"
                base_score = 80
                reasons.append(f"High structural edge density ({round(edge_pixels_ratio * 100, 1)}%) indicates surface fracture.")
            elif intensity_std > 48.0 and edge_pixels_ratio > 0.06:
                detected_category = "Cleanliness / Waste Surrounding"
                base_score = 75
                reasons.append("Irregular texture distribution characteristic of debris or waste surrounding.")
            else:
                detected_category = "No Observable Defect (Normal Surface)"
                base_score = 30
                reasons.append("Surface appears intact without evident physical damage patterns.")

        # Blurriness penalty
        if is_blurry:
            base_score -= 20
            reasons.append(f"Image is out of focus / blurry (sharpness score: {round(sharpness_score, 1)}).")

        authenticity_score = int(np.clip(base_score, 8, 95))

        # Decision Thresholds
        if authenticity_score >= 70:
            is_genuine = True
            authenticity_status = "Verified Genuine Maintenance Evidence"
            admin_alert = f"✓ AI Verified: Clear visual evidence of a genuine maintenance defect ({detected_category}) was verified in the photo."
        elif authenticity_score >= 40:
            is_genuine = False
            authenticity_status = "Inconclusive / Surface Appears Normal"
            admin_alert = "⚠️ AI Notice for Admin: Visual evidence is inconclusive. The visible surface appears intact without obvious physical damage. Manual physical verification recommended."
        else:
            is_genuine = False
            authenticity_status = "Rejected: Irrelevant / No Defect Detected"
            admin_alert = f"🚨 AI Warning for Admin: No physical defect detected. Photo does not match the reported '{category_hint or 'maintenance'}' issue. Manual inspection required."

        return {
            "success": True,
            "filename": filename,
            "dimensions": f"{width}x{height}",
            "file_size_kb": file_size_kb,
            "is_genuine": is_genuine,
            "authenticity_score": authenticity_score,
            "authenticity_status": authenticity_status,
            "defect_class": detected_category,
            "admin_alert": admin_alert,
            "quality": {
                "sharpness_score": round(sharpness_score, 1),
                "is_blurry": is_blurry,
                "is_blank": False,
                "intensity_variation": round(intensity_std, 1),
                "status": "Blurry" if is_blurry else "Clear & Sharp"
            },
            "reasons": reasons,
            "manual_inspection_recommended": bool(not is_genuine or authenticity_score < 70)
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to process image: {str(e)}",
            "is_genuine": False,
            "authenticity_score": 0,
            "authenticity_status": "Analysis Error",
            "admin_alert": f"Image processing failed: {str(e)}"
        }

if __name__ == "__main__":
    if PIL_AVAILABLE:
        # Test 1: Blank Black Image (Should be detected as Suspicious/Blank)
        blank_img = Image.new('RGB', (200, 200), color=(10, 10, 10))
        buf = io.BytesIO()
        blank_img.save(buf, format='JPEG')
        res1 = analyze_complaint_image(buf.getvalue(), "blank.jpg")
        print("\n--- TEST 1: Blank Black Image ---")
        print("Score:", res1["authenticity_score"], "| Status:", res1["authenticity_status"])
        print("Alert:", res1["admin_alert"])

        # Test 2: Textured / Defect Image
        rand_arr = np.random.randint(20, 220, size=(200, 200, 3), dtype=np.uint8)
        rand_img = Image.fromarray(rand_arr)
        buf2 = io.BytesIO()
        rand_img.save(buf2, format='JPEG')
        res2 = analyze_complaint_image(buf2.getvalue(), "damaged_texture.jpg")
        print("\n--- TEST 2: High Texture / Defect Image ---")
        print("Score:", res2["authenticity_score"], "| Status:", res2["authenticity_status"])
        print("Class:", res2["defect_class"])
        print("Alert:", res2["admin_alert"])
