#!/usr/bin/env bash
# Publishes the current working tree to the test site
# https://eecheproducts-cloud.github.io/nico-fix-web-test/ (repo nico-fix-web-test), pointing the
# booking page at bookingTest, with noindex, no GA, no CNAME and a fixed "PRUEBA" banner.
# Never touches nicofix.nl. Uso: bash scripts/publish-test.sh [URL de bookingTest]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_API="${1:-https://europe-west4-nico-fix-bot.cloudfunctions.net/bookingTest}"
WORK="$(mktemp -d)"
git clone -q --depth 1 https://github.com/eecheproducts-cloud/nico-fix-web-test.git "$WORK/site"
find "$WORK/site" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
( cd "$ROOT" && git ls-files -z | xargs -0 -I{} cp --parents {} "$WORK/site/" )
rm -f "$WORK/site/CNAME"
sed -i "s#^export const BOOKING_API = .*#export const BOOKING_API = '${TEST_API}';#" "$WORK/site/assets/js/config.js"
sed -i "s#^export const GA_ID = .*#export const GA_ID = '';#" "$WORK/site/assets/js/consent.js"
printf 'User-agent: *\nDisallow: /\n' > "$WORK/site/robots.txt"
python - "$WORK/site" <<'PY'
import glob, os, re, sys
banner = ('<div style="position:sticky;top:0;z-index:9999;background:#c0392b;color:#fff;text-align:center;'
          'padding:8px 12px;font:600 14px/1.3 sans-serif">PRUEBA: no es el sitio real de Nico Fix. '
          'No reserves ni cargues datos reales. / TEST: not the real site.</div>')
for f in glob.glob(os.path.join(sys.argv[1], '*.html')):
    s = open(f, encoding='utf-8').read()
    s = s.replace('<head>', '<head>\n  <meta name="robots" content="noindex, nofollow">', 1)
    s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + '\n' + banner, s, count=1)
    open(f, 'w', encoding='utf-8').write(s)
PY
cd "$WORK/site"
git -c user.name="eecheproducts-cloud" -c user.email="e.echeproducts@gmail.com" add -A
git -c user.name="eecheproducts-cloud" -c user.email="e.echeproducts@gmail.com" commit -qm "Sitio de prueba desde $(cd "$ROOT" && git rev-parse --short HEAD)" || true
git push -q origin HEAD:main
echo "Publicado: https://eecheproducts-cloud.github.io/nico-fix-web-test/reservar.html"
