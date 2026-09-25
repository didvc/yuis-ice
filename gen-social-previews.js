#!/usr/bin/env node
// GitHub social preview (1280x640): the background image with the tagline set on a
// golden-ratio slope (rise 0.618 per run, ~31.7deg) from bottom-left to top-right.
// The text is composited with Difference so it stays legible over both the dark sky
// and the white ground. Requires ImageMagick 6 (`convert`).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = join(DIR, ".personal/6c884323-b7f6-4f19-a176-9f11ccfc9a8d.jpg");
const OUT = join(DIR, "social-previews.png");
const FONT = "/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf";
const ANGLE = 328.3; // -31.7deg, atan(0.618)

// Baseline origin of each line; successive lines step down-right, perpendicular to the slope
const LINES = [
  [32, 350, "{ The professional"],
  [60, 396, "  homebody |"],
  [88, 442, "  a single rabbit++ |"],
  [116, 488, "  Tokyo, since 2016 }"],
];

const convert = (...args) => execFileSync("convert", args, { stdio: "inherit" });

const tmp = mkdtempSync(join(tmpdir(), "social-preview-"));
try {
  const base = join(tmp, "base.png");
  const text = join(tmp, "text.png");

  convert(SRC, "-gravity", "center", "-crop", "1280x640+0+0", "+repage", base);

  convert(
    "-size", "1280x640", "xc:none", "-font", FONT, "-fill", "white",
    "-gravity", "northwest", "-pointsize", "36",
    ...LINES.flatMap(([x, y, s]) => ["-annotate", `${ANGLE}x${ANGLE}+${x}+${y}`, s]),
    text,
  );

  convert(base, text, "-compose", "Difference", "-composite", "-strip", OUT);
  console.error(`Generated ${OUT}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
