# Déploiement production — OSIRIS Front

Next.js (standalone) derrière Nginx TLS sur le VPS OVH partagé avec le backend.

| Élément | Valeur |
|---------|--------|
| Domaine | `https://osiris.qsoul.africa` |
| Conteneur | `osiris-front` → `127.0.0.1:3000` |
| API | `NEXT_PUBLIC_API_URL=https://apiosiris.qsoul.africa/api` |
| Chemin VPS | `/opt/osiris_front` |

## Prérequis

- DNS A `osiris.qsoul.africa` → IP du VPS
- Docker Engine + Compose plugin
- Nginx + Certbot (déjà présents si le backend est déployé)
- Backend CORS / Keycloak : origine `https://osiris.qsoul.africa` déjà autorisée

## Première installation (VPS)

```bash
sudo mkdir -p /opt/osiris_front
sudo chown ubuntu:ubuntu /opt/osiris_front
git clone https://github.com/Fabricejor/Osiris_front.git /opt/osiris_front
cd /opt/osiris_front
cp .env.example .env
chmod +x infra/deploy.sh
./infra/deploy.sh
```

### Nginx + TLS

```bash
sudo cp infra/nginx/osiris.qsoul.africa.conf /etc/nginx/sites-available/osiris.qsoul.africa.conf
sudo ln -sfn /etc/nginx/sites-available/osiris.qsoul.africa.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d osiris.qsoul.africa --non-interactive --agree-tos -m admin@qsoul.africa --redirect
```

## Mise à jour

```bash
cd /opt/osiris_front
git pull
./infra/deploy.sh
```

Toute modification de `NEXT_PUBLIC_API_URL` exige un **rebuild** (`deploy.sh` rebuild systématiquement).

## Smoke tests

```bash
curl -sfI http://127.0.0.1:3000/
curl -sfI https://osiris.qsoul.africa/
curl -sf https://apiosiris.qsoul.africa/api/v1/health
```
