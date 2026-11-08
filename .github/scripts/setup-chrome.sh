#!/usr/bin/env bash
# Installs stable Google Chrome (deb pulls all system deps) + a runner-safe wrapper.
# Usage: bash .github/scripts/setup-chrome.sh
set -euo pipefail

sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends ffmpeg fonts-liberation wget ca-certificates >/dev/null

cd "$HOME"
wget -q -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ls -lh chrome.deb && dpkg-deb -f chrome.deb Package
sudo apt-get install -y -qq ./chrome.deb >/dev/null
rm -f chrome.deb

mkdir -p "$HOME/bin"
printf '#!/usr/bin/env bash\nexec /usr/bin/google-chrome-stable --no-sandbox --disable-dev-shm-usage "$@"\n' > "$HOME/bin/chrome-ci"
chmod +x "$HOME/bin/chrome-ci"

"$HOME/bin/chrome-ci" --version
echo "CHROME=$HOME/bin/chrome-ci" >> "$GITHUB_ENV"
