TODO

1-login
2-logout
3-crear proyecto
4-mostrar datos de home
5-controles nginx
6-controles env
7-controles pm2
8-controles git
9-logs
10-acciones

0- verificar que pm2 se ejecuta como [appUser]
ps aux | grep pm2

1-[appManager][appUser] clonamos el repositorio
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
