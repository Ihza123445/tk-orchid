#!/usr/bin/env bash
# Render semua diagram PlantUML di docs/diagram/src menjadi PNG & SVG.
# Kebutuhan: Java 11+ dan Graphviz (perintah `dot`). PlantUML diunduh otomatis.
set -euo pipefail
cd "$(dirname "$0")/.."

JAR="${PLANTUML_JAR:-.cache/plantuml.jar}"
if [ ! -f "$JAR" ]; then
  mkdir -p "$(dirname "$JAR")"
  echo "Mengunduh PlantUML ke $JAR ..."
  curl -sSfL -o "$JAR" https://repo1.maven.org/maven2/net/sourceforge/plantuml/plantuml/1.2025.4/plantuml-1.2025.4.jar
fi

JAR="$(cd "$(dirname "$JAR")" && pwd)/$(basename "$JAR")"
cd docs/diagram/src
java -DPLANTUML_LIMIT_SIZE=16384 -jar "$JAR" -tpng -o ../png ./*.puml
java -DPLANTUML_LIMIT_SIZE=16384 -jar "$JAR" -tsvg -o ../svg ./*.puml
echo "Selesai: docs/diagram/png & docs/diagram/svg"
