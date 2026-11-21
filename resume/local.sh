#!/bin/sh
# Builds a tailored resume WITH the private contact file, on this machine only (CI refuses private
# contact details). Usage: ATSGATE=/path/to/atsgate npm run resume -- TAILORING.yaml BLUEPRINT OUT_DIR
# BLUEPRINT is anything `atsgate gate --blueprint` accepts (builtin:ID, a file, generate:POSTING).
set -eu
: "${ATSGATE:?set ATSGATE to the atsgate binary (https://github.com/Avarok-Cybersecurity/atsgate/releases)}"
[ $# -eq 3 ] || { echo "usage: npm run resume -- TAILORING.yaml BLUEPRINT OUT_DIR" >&2; exit 2; }
mkdir -p "$3"
"$ATSGATE" import --from tbraun96 --input content/career.json --out "$3/career.json"
"$ATSGATE" gate --career "$3/career.json" --tailoring "$1" --contact resume/contact.private.json \
  --allow-private-contact --out "$3" --blueprint "$2" --fail-on-integrity-flags true --as-of today \
  --report "$3/report.json" --summary "$3/report.md"
