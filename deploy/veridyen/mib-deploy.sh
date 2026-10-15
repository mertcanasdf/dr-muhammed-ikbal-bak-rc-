#!/bin/bash
# GitHub mertcanasdf/mib-site (main) -> Veridyen public_html otomatik yayını.
# cPanel cron'u 15 dakikada bir çalıştırır:  */15 * * * * /bin/bash $HOME/mib-deploy.sh
# Elle tam yayın:                            bash ~/mib-deploy.sh --force
#
# Güvenlik ilkeleri:
# - Yalnız yayın reposundaki dosyaları yazar; yalnız daha önce kendi yazdığı ve repodan kalkan dosyaları siler
#   (eski/, .well-known, cgi-bin, error_log gibi sunucuya ait dosyalara dokunmaz).
# - .htaccess yazılmaz: sunucudaki LiteSpeed'e uyarlanmış kurallar korunur.
# - Repo şüpheli derecede küçükse (bozuk/yarım çekme) hiçbir şey yapmaz.
set -euo pipefail
export LC_ALL=C   # sort ve comm aynı sıralamayı kullansın (silme listesi doğru çıksın)

REPO_URL="https://github.com/mertcanasdf/mib-site.git"
SRC="${MIB_SRC:-$HOME/mib-site}"
DEST="${MIB_DEST:-$HOME/public_html}"
MANIFEST="$HOME/.mib-deploy-manifest"
LOG="$HOME/mib-deploy.log"
MIN_FILES=50

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"; }

# Aynı anda iki çalışma olmasın.
if command -v flock >/dev/null 2>&1; then
  exec 9>"$HOME/.mib-deploy.lock"
  flock -n 9 || exit 0
fi

command -v git >/dev/null 2>&1 || { log "HATA: git bulunamadı"; exit 1; }
[ -d "$DEST" ] || { log "HATA: hedef klasör yok: $DEST"; exit 1; }

if [ ! -d "$SRC/.git" ]; then
  git clone -q --depth 1 --branch main "$REPO_URL" "$SRC"
  log "repo klonlandı"
fi

cd "$SRC"
OLD=$(git rev-parse HEAD)
git fetch -q --depth 1 origin main
NEW=$(git rev-parse FETCH_HEAD)

if [ "$OLD" = "$NEW" ] && [ -f "$MANIFEST" ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi
git reset -q --hard FETCH_HEAD

# Yayınlanacak dosyalar (.htaccess hariç).
git ls-files | grep -v -x '\.htaccess' | sort > "$MANIFEST.new"
COUNT=$(wc -l < "$MANIFEST.new" | tr -d ' ')
if [ "$COUNT" -lt "$MIN_FILES" ] || ! grep -q -x 'index.html' "$MANIFEST.new"; then
  log "DURDU: repo beklenenden küçük ($COUNT dosya) ya da index.html yok; hiçbir şey değiştirilmedi"
  rm -f "$MANIFEST.new"
  exit 1
fi

# Kopyala (dizin yapısıyla, zaman damgalarıyla).
tar -C "$SRC" -cf - -T "$MANIFEST.new" | tar -C "$DEST" -xf -

# Önceki yayında olup artık repoda olmayan dosyaları sil (yalnız manifestte kayıtlı olanlar).
REMOVED=0
if [ -f "$MANIFEST" ]; then
  while IFS= read -r f; do
    case "$f" in ""|/*|*..*) continue ;; esac
    if [ -f "$DEST/$f" ]; then rm -f "$DEST/$f"; REMOVED=$((REMOVED + 1)); fi
  done < <(comm -23 "$MANIFEST" "$MANIFEST.new")
fi
mv "$MANIFEST.new" "$MANIFEST"

log "yayınlandı ${OLD:0:7} -> ${NEW:0:7}: $COUNT dosya, $REMOVED silindi"
# Günlük dosyası büyümesin.
tail -n 500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
