#!/usr/bin/env bash
set -euo pipefail

INPUT="$1"
OUTPUT="website/public/bg.mp4"
FFMPEG_BIN="${FFMPEG_BIN:-ffmpeg}"

mkdir -p website/public

"$FFMPEG_BIN" -y -i "$INPUT" -an -c:v libx264 -preset slow -crf 18 \
  -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT"

echo "Encoded background video (keyframe every 8 frames) to $OUTPUT"
