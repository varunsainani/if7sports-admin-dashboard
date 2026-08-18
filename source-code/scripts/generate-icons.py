#!/usr/bin/env python3
"""
Generates the browser icon set from a single geometric definition.

Not part of the build. It is a one-off asset generator (needs Pillow and
ImageMagick) kept in the repo so the mark can be regenerated if the palette
moves, rather than living as opaque binaries nobody can edit.

The favicon is a distilled version of the sidebar mark, not a shrunken copy of
it. The sidebar draws an inset pitch with a halfway line, a centre circle and
two penalty boxes; at 16px the boxes collapse into noise, so they are dropped
and the pitch goes full bleed. What survives is what still reads at 16px: a
green ground, one halfway line, one centre circle.

The halfway line runs edge to edge on purpose. An earlier pass floated it
inside the tile and the mark read as a Greek phi: without touching the
touchlines there is nothing to say the green is a pitch rather than a
background.

The markings use laton-200 rather than the laton-300 of the sidebar mark.
laton-300 on cesped-500 measures 2.98:1, which is fine for a 28px mark sitting
in a dark rail but leaves a 16px ring to be eaten by antialiasing. laton-200
measures 4.10:1 and holds.

Everything is drawn on a 32-unit grid and supersampled 4x before downsampling,
so the curves stay clean at every size.
"""

import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
APP = RAIZ / "app"

# Straight from lib/tokens.css. Kept as literals here because an .ico has no
# access to custom properties; if the tokens move, these move with them.
CESPED_500 = (11, 107, 87, 255)   # --cesped-500  pitch ground
LATON_200 = (228, 206, 152, 255)  # --laton-200   markings

REJILLA = 32.0  # design grid
SS = 4          # supersample factor


def perfil(px: int) -> dict:
    """Per-size optical adjustments.

    A stroke that is correct at 256px is a grey smear at 16px, so the small
    sizes get proportionally heavier lines. This is the whole reason each size
    is drawn rather than resized from one master.

    At 16px the halfway line and the ring need different weights. The line wants
    to land on exactly two solid pixels, which is 4 design units; the ring at
    that weight closes into a blob, so it stays at 3 and keeps its hole. Above
    16px the pixel grid stops fighting and both settle at the same value.

    `radio_circulo` is the outer radius: Pillow grows an ellipse stroke inward
    from its bounding box.
    """
    if px <= 16:
        return {"trazo": 4.0, "trazo_circulo": 3.0, "radio_circulo": 6.6, "radio_esquina": 6.5}
    if px <= 32:
        return {"trazo": 2.4, "trazo_circulo": 2.4, "radio_circulo": 6.4, "radio_esquina": 7.0}
    return {"trazo": 2.0, "trazo_circulo": 2.0, "radio_circulo": 6.4, "radio_esquina": 7.0}


def dibujar(px: int, sangrado_completo: bool = True) -> Image.Image:
    p = perfil(px)
    lienzo = px * SS
    k = lienzo / REJILLA  # design units -> supersampled pixels

    img = Image.new("RGBA", (lienzo, lienzo), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # ---------------------------------------------------------- pitch ground
    if sangrado_completo:
        d.rounded_rectangle(
            [0, 0, lienzo - 1, lienzo - 1],
            radius=p["radio_esquina"] * k,
            fill=CESPED_500,
        )
    else:
        # Apple home-screen icons are masked by the OS, so the artwork must be
        # a full square with no rounding of its own.
        d.rectangle([0, 0, lienzo - 1, lienzo - 1], fill=CESPED_500)

    medio = REJILLA / 2
    centro = medio * k  # geometric centre, in supersampled pixels

    def centrado(ancho: float) -> tuple[int, int]:
        """Integer pixel span of `ancho` centred on the canvas centre.

        Pillow places an even-width stroke one pixel right of the coordinate it
        is handed, which left the halfway line visibly off centre against the
        ring. Rounding the span explicitly keeps every size symmetrical.
        """
        grosor = max(1, round(ancho * k))
        inicio = round(centro - grosor / 2)
        return inicio, inicio + grosor - 1

    # --------------------------------------------------------- halfway line
    x0, x1 = centrado(p["trazo"])
    d.rectangle([x0, 0, x1, lienzo], fill=LATON_200)

    # --------------------------------------------------------- centre circle
    c0, c1 = centrado(p["radio_circulo"] * 2)
    d.ellipse(
        [c0, c0, c1, c1],
        outline=LATON_200,
        width=max(1, round(p["trazo_circulo"] * k)),
    )

    return img.resize((px, px), Image.LANCZOS)


def escribir_svg(destino: Path) -> None:
    """Vector twin of the raster mark, for browsers that take an SVG favicon.

    Geometry matches the >=48px profile: the optical corrections above exist to
    survive a pixel grid, and a vector icon never meets one.
    """
    p = perfil(64)
    destino.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" '
        'role="img" aria-label="IF7SPORTS">\n'
        f'  <rect width="32" height="32" rx="{p["radio_esquina"]}" fill="#0b6b57"/>\n'
        f'  <path d="M16 0V32" stroke="#e4ce98" '
        f'stroke-width="{p["trazo"]}"/>\n'
        f'  <circle cx="16" cy="16" r="{p["radio_circulo"] - p["trazo_circulo"] / 2}" fill="none" '
        f'stroke="#e4ce98" stroke-width="{p["trazo_circulo"]}"/>\n'
        "</svg>\n",
        encoding="utf-8",
    )


def main() -> None:
    temporales = []
    for px in (16, 32, 48, 64):
        ruta = Path("/tmp") / f"if7-icon-{px}.png"
        dibujar(px).save(ruta)
        temporales.append(str(ruta))

    # ImageMagick writes BMP-encoded .ico entries, which every browser and every
    # version of Windows reads. PNG-in-ICO is smaller but narrower in support.
    subprocess.run(["convert", *temporales, str(APP / "favicon.ico")], check=True)

    dibujar(180, sangrado_completo=False).save(APP / "apple-icon.png")
    escribir_svg(APP / "icon.svg")

    print("favicon.ico   16/32/48/64")
    print("icon.svg      vector")
    print("apple-icon.png 180 (full bleed, OS masks it)")


if __name__ == "__main__":
    main()
