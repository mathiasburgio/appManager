# appManager

**appManager** is a tool for managing projects running on **PM2**.  

## Features
- Visualization of projects registered in PM2 with detailed information and status for each.
- Ability to perform `git pull` actions.
- Control to stop, restart, and start projects in PM2.
- NGINX configuration file reading.
- `.env` file reading.
- Log reading.
- Action to clear logs (`flush logs`).

It is recommended to use **appManager** together with [config-cloud](https://github.com/mathiasburgio/config-cloud).

---

## Configuration Steps

### Prerequisites
Before configuring **appManager**, ensure you have the following installed and working:
- **git**
- **PM2**
- **NGINX**
- Preferably a **non-root user** ([appUser]) to execute the processes.

### Steps

1. **[appUser] Clone the repository**  
   ```bash
   cd /var/www
   git clone https://github.com/mathiasburgio/appManager





appManager sirve para gestionar proyectos que corren en pm2. 
Cuenta con las siguientes funciones:
-visualizacion de proyectos registrados en pm2 con informacion y estado de cada uno
-accion de hacer git pull
-control de detener, reiniciar e iniciar proyectos en pm2
-lectura de archivo nginx
-lectura de archivo .env
-lectura de logs
-accion de limpiar logs (flush logs)

Es aconsejable utilizarlo en conjunto con https://github.com/mathiasburgio/config-cloud

Pasos para configurar appManager

0-Previo a la configuracion se debe tener instalado y funcionando git, pm2, nginx y preferentemente un usuario NO ROOT [appUser] para ejecutar los procesos.

1-[appUser] Clonamos repositorio
cd /var/www
git clone https://github.com/mathiasburgio/appManager

2-[appUser] Instalamos dependencias
cd /appManager
npm install

3-[appUser] Clonamos .env_example y lo editamos
cp .env_example .env
nano .env

4-[root] configuramos archivo nginx (utilizamos el archivo modelo)
#copiamos el modelo
sudo cp /var/www/appManager/nginx-example-file /etc/nginx/sites-available/appManager
#editamos el archivo (modificar el dominio/url y el puerto a utilizar [puerto 9500 para appManager])
sudo nano /etc/nginx/sites-available/appManager
#creamos el enlace simbolico
sudo ln -s /etc/nginx/sites-available/appManager /etc/nginx/sites-enabled/
#verificamos que este todo ok
nginx -t
#reiniciamos nginx
systemctl restart nginx

5-[appUser] inicializamos la aplicacion
pm2 start /var/www/appManager/main.js --name appManager
pm2 save

6-[browser] ingresamos y configuramos usuario
Ingresamos desde el navegador a la aplicación.
Para configurar usuario y contraseña, debemos utilizar el mismo email de usuario que esta configurado en appManager/.env y la 1ra vez que ingresemos la contraseña esta se guardara en el archivo appManager/.password




Para agregar proyectos a gestionar hacer lo siguiente desde SSH:

1-[appUser] Clonamos repositorio
repositorio publico -> git clone https://...git {folderName}
repositorio privado -> git clone https://{token}:x-oauth-basic@{url}.git {folderName}

2-[appUser] Instalamos dependencias
cd /var/www/{folderName}
npm install

3-[appUser] Clonamos .env_example y lo editamos
cp .env_example .env
nano .env

4-[root] configuramos archivo nginx (utilizamos el archivo modelo)
#copiamos el modelo (o utilizamos uno personalizado)
sudo cp /var/www/appManager/nginx-example-file /etc/nginx/sites-available/{domain or appName}
#editamos el archivo
sudo nano /etc/nginx/sites-available/{domain or appName}
#creamos el enlace simbolico
sudo ln -s /etc/nginx/sites-available/{domain or appName} /etc/nginx/sites-enabled/
#verificamos que este todo ok
nginx -t
#reiniciamos nginx
systemctl restart nginx

5-[appUser] inicializamos la aplicacion
pm2 start /var/www/{folderName}/{mainFile} --name {appName}
pm2 save

6-[appUser] editamos el .env de appManager
nano /var/www/appManager/.env
#agregamos la asociacion entre el archivo nginx y la app separada con el siguiente formato
APP_NGINX_ASSOCIATION="app1 : nginxFile & app2 : nginxFile2"

7-[appUser] reiniciamos appManager
pm2 restart appManager