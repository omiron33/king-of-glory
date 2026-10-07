#!/bin/sh
# tools/sheet.sh out.jpg a.png b.png ... : a 2-wide contact sheet at half size, for reviewing stills
out=$1; shift
n=$#; rows=$(( (n + 1) / 2 ))
ffmpeg -v error -y $(for f in "$@"; do printf -- '-i %s ' "$f"; done) -filter_complex "$(i=0; for f in "$@"; do printf '[%d]scale=960:540[v%d];' $i $i; i=$((i+1)); done; i=0; for f in "$@"; do printf '[v%d]' $i; i=$((i+1)); done; [ $((n % 2)) -eq 1 ] && printf 'color=black:960x540:d=1[pad];' >/dev/null; printf 'xstack=inputs=%d:layout=' $n; i=0; for f in "$@"; do printf '%s%d_%d' "$([ $i -gt 0 ] && echo '|')" $(( (i % 2) * 960 )) $(( (i / 2) * 540 )); i=$((i+1)); done)" -q:v 3 "$out"
