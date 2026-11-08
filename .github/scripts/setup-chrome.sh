#!/usr/bin/env bash
# Installs Chrome for Testing + a sandbox-tolerant wrapper for GitHub runners.
# Usage: bash .github/scripts/setup-chrome.sh
set -euo pipefail

if ! command -v jq >/dev/null; then sudo apt-get update -qq && sudo apt-get install -y --no-install-recommends jq fonts-liberation >/dev/null; fi
sudo apt-get install -y --no-install-recommends ffmpeg >/dev/null

mkdir -p "$HOME/chrome"
cd "$HOME/chrome"
VERTAG=$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json | jq -r '.channels.Stable.version')
echo "Chrome for Testing: $VERTAG"
curl -fsSL -o chrome.zip "https://storage.googleapis.com/chrome-for-testing-public/$VERTAG/linux64/chrome-linux64.zip"
unzip -oq chrome.zip && rm -f chrome.zip

mkdir -p "$HOME/bin"
printf '#!/usr/bin/env bash\nexec %s/chrome-linux64/chrome --no-sandbox --disable-dev-shm-usage "$@"\n' "$HOME" > "$HOME/bin/chrome-ci"
chmod +x "$HOME/bin/chrome-ci"
echo "CHROME=$HOME/bin/chrome-ci" >> "$GITHUB_ENV"
echo "chrome ready: $HOME/bin/chrome-ci"
