# Deployment: Hetzner Cloud Server

## Quick Setup

1. **Create Hetzner Cloud Server:**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM (4GB recommended)
   - SSH key authentication

2. **SSH, clone repo, and run setup:**
   ```bash
   ssh root@your-server-ip
   cd /opt
   git clone <your-repository-url> journo-crawler
   cd journo-crawler
   chmod +x setup-server.sh
   sudo ./setup-server.sh
   ```

3. **Set up daily cron job:**
   ```bash
   chmod +x /opt/journo-crawler/scripts/cron-daily.sh
   chown journo:journo /opt/journo-crawler/scripts/cron-daily.sh
   sudo crontab -u journo -e
   ```
   
   Add: `0 2 * * * /opt/journo-crawler/scripts/cron-daily.sh`

## Manual Run

```bash
cd /opt/journo-crawler
npm run start:prod
```

## View Logs

```bash
tail -f /var/log/journo-crawler/cron.log
tail -f /var/log/journo-crawler/crawler.log
```

## Update Application

```bash
cd /opt/journo-crawler
git pull
npm install
npm run build
```
