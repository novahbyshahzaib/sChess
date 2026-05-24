#!/bin/bash
set -e

echo "=== Downloading sChess assets from Lichess ==="

# Sparse clone only the piece and sound directories (no full repo needed)
git clone \
  --no-checkout \
  --depth=1 \
  --filter=blob:none \
  https://github.com/lichess-org/lila.git \
  lila-temp

cd lila-temp
git sparse-checkout init --cone
git sparse-checkout set public/piece public/sound/standard
git checkout
cd ..

echo "=== Creating folder structure ==="

# Create all public asset folders
mkdir -p public/pieces/classic
mkdir -p public/pieces/neo
mkdir -p public/pieces/gothic
mkdir -p public/pieces/alpha
mkdir -p public/pieces/fantasy
mkdir -p public/pieces/pirouetti
mkdir -p public/boards
mkdir -p public/sounds

echo "=== Copying piece sets ==="

# Map: Lichess folder name → sChess theme folder name
declare -A PIECE_MAP=(
  ["cburnett"]="classic"
  ["spatial"]="neo"
  ["gothic"]="gothic"
  ["alpha"]="alpha"
  ["fantasy"]="fantasy"
  ["pirouetti"]="pirouetti"
)

PIECES="wK wQ wR wB wN wP bK bQ bR bB bN bP"

for LICHESS_NAME in "${!PIECE_MAP[@]}"; do
  THEME_NAME="${PIECE_MAP[$LICHESS_NAME]}"
  for PIECE in $PIECES; do
    SRC="lila-temp/public/piece/${LICHESS_NAME}/${PIECE}.svg"
    DST="public/pieces/${THEME_NAME}/${PIECE}.svg"
    if [ -f "$SRC" ]; then
      cp "$SRC" "$DST"
    else
      echo "WARNING: missing $SRC"
    fi
  done
  echo "✓ Copied piece set: $LICHESS_NAME → pieces/$THEME_NAME"
done

echo "=== Copying sounds ==="

# Map: Lichess sound file → sChess sound file name
cp lila-temp/public/sound/standard/Move.mp3       public/sounds/move-self.mp3       2>/dev/null || true
cp lila-temp/public/sound/standard/Move.mp3       public/sounds/move-opponent.mp3   2>/dev/null || true
cp lila-temp/public/sound/standard/Capture.mp3    public/sounds/capture.mp3         2>/dev/null || true
cp lila-temp/public/sound/standard/Castling.mp3   public/sounds/castle.mp3          2>/dev/null || true
cp lila-temp/public/sound/standard/Check.mp3      public/sounds/check.mp3           2>/dev/null || true
cp lila-temp/public/sound/standard/GenericNotify.mp3 public/sounds/game-end.mp3    2>/dev/null || true
cp lila-temp/public/sound/standard/Move.mp3       public/sounds/illegal.mp3         2>/dev/null || true

echo "✓ Sounds copied"

echo "=== Cleaning up temp clone ==="
rm -rf lila-temp

echo "=== All assets ready ==="
