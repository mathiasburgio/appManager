NOTA PREVIA:
utilizar para todo 2 nombres:
dominio lo utilizamos como nombre de archivo en nginx
nombreApp lo utilizamos para nombre de carpeta y nombre de app en pm2

0- verificar que pm2 se ejecuta como [appUser]
ps aux | grep pm2

1-[appUser] clonamos el repositorio
repositorio publico -> git clone https://...git {folderName}
repositorio privado -> git clone https://{token}:x-oauth-basic@{url}.git {folderName}

3-[appUser] instalamos dependencias
cd /var/www/{folderName}
npm install

4-[appUser] clonamos .env_example y editamos
cp .env_example .env
nano .env

4-[root] configurar nginx
sudo nano /etc/nginx/sites-available/{dominio}
sudo ln -s /etc/nginx/sites-available/{dominio} /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

5-[appUser] inicializamos la aplicacion
pm2 start /var/www/{folderName}/{main.js} --name {projectName}
pm2 save

6-Ingresamos al sitio
7-Cargamos los datos del nuevo proyecto
8-Verificamos "git pull", "pm2 restart", ".env", "nginx"
