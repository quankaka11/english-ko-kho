"""Xuất ảnh thương hiệu (avatar, banner, bảng nhận diện) ra brand/exports/.

    python scripts/export_brand.py
"""
from common import ROOT, npx

STILLS = {
    "BrandSheet": "brand-sheet.png",
    "Avatar": "avatar-800.png",
    "Banner": "youtube-banner-2560x1440.png",
}


def main() -> None:
    out = ROOT / "brand" / "exports"
    out.mkdir(parents=True, exist_ok=True)
    for comp, name in STILLS.items():
        npx("remotion", "still", comp, str(out / name), "--log=error")
    print(f"Đã xuất {len(STILLS)} ảnh vào {out}")


if __name__ == "__main__":
    main()
