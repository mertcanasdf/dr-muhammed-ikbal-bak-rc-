# Veridyen otomatik yayın

Akış:
1. Codex (her gün 10.00) ya da Claude yayını GitHub'daki `mertcanasdf/mib-site` reposunun `main` dalına gönderir.
2. Veridyen'deki cron 15 dakikada bir `mib-deploy.sh`'yi çalıştırır.
3. Betik değişiklik varsa repoyu çeker ve `public_html`'e kopyalar.

Elle çekme gerekmez.

## Kurulum (16 Ekim 2026'da yapıldı)

Hesapta kabuk (shell) erişimi kapalı, bu yüzden Terminal yok. Kurulum yalnızca cPanel › Cron İşleri ile yapıldı. Komut betiği ilk çalışmada GitHub'dan kendisi indirir:

```
*/15 * * * *  [ -f $HOME/mib-deploy.sh ] || curl -fsSL -o $HOME/mib-deploy.sh https://raw.githubusercontent.com/mertcanasdf/dr-muhammed-ikbal-bak-rc-/sprint-1/deploy/veridyen/mib-deploy.sh; /bin/bash $HOME/mib-deploy.sh >>$HOME/mib-deploy.cron.log 2>&1
```

İlk yayın: `2026-10-16 20:20 yayınlandı c556545: 325 dosya`. Betik bir kez indirildikten sonra güncellenmez. Betik değişirse sunucudaki `~/mib-deploy.sh` silinir; cron bir sonraki çalışmada yenisini indirir.

Günlükler shell olmadan da okunabilir. cPanel oturumundayken şu adres açılır (`cpsessXXXX` oturum numarasıdır):
`https://asral.veridyen.com:2083/cpsessXXXX/execute/Fileman/get_file_content?dir=%2Fhome%2Fdrmuhammedikbal&file=mib-deploy.log`

## Elle kurulum (shell erişimi olan bir sunucuda)

1. **Betiği yükle:** cPanel › Dosya Yöneticisi › ev dizini (`/home/drmuhammedikbal`, `public_html`'in bir üstü). Bu klasördeki `mib-deploy.sh` dosyasını oraya yükle.
   - Terminal varsa tek komut yeterli:
     `curl -fsSL -o ~/mib-deploy.sh https://raw.githubusercontent.com/mertcanasdf/dr-muhammed-ikbal-bak-rc-/sprint-1/deploy/veridyen/mib-deploy.sh`
2. **İlk yayını elle dene** (Terminal varsa): `bash ~/mib-deploy.sh --force && tail -3 ~/mib-deploy.log`
   - Beklenen satır: `yayınlandı … : 3xx dosya, 0 silindi`
3. **Cron'u ekle:** cPanel › Cron İşleri › "Ortak Ayarlar: 15 dakikada bir" seç, komut:
   `/bin/bash $HOME/mib-deploy.sh >/dev/null 2>&1`

## Ne yapar, ne yapmaz

- Yalnızca yayın reposundaki dosyaları yazar.
- Repodan kalkan dosyalardan yalnızca daha önce kendi yazdıklarını siler. `eski/`, `.well-known` (SSL), `cgi-bin`, `error_log` gibi sunucuya ait dosyalara dokunmaz.
- **`.htaccess` dosyasını yazmaz.** Sunucudaki LiteSpeed'e uyarlanmış kurallar korunur. Kural değişikliği gerekirse `.htaccess` sunucuda elle güncellenir.
- Repo 50 dosyadan azsa ya da `index.html` yoksa durur ve hiçbir şeyi değiştirmez (bozuk ya da yarım çekmeye karşı koruma).
- Günlük kaydı: `~/mib-deploy.log`. Son 500 satır tutulur.

## Sorun giderme

| Durum | Bak |
|---|---|
| Site güncellenmiyor | `~/mib-deploy.log` son satırı. `HATA: git bulunamadı` görünüyorsa cPanel › Git Version Control'ün açık olması gerekir. |
| "DURDU: repo beklenenden küçük" | GitHub'daki `mib-site` main dalını kontrol et. Yanlış bir push yapılmış olabilir. |
| Hemen yayınlamak | `bash ~/mib-deploy.sh --force` |
