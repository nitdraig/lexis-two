#!/usr/bin/env bash
flag="$HOME/.claude/.lexis-two-active"
[ -f "$flag" ] || exit 0

mode=$(head -n1 "$flag" | tr -d '[:space:]')

if [ -z "$mode" ] || [ "$mode" = "full" ]; then
    printf '\033[38;5;108m[LEXIS-TWO]\033[0m'
else
    printf '\033[38;5;108m[LEXIS-TWO:%s]\033[0m' "$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
fi
