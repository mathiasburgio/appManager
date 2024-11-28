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
   ```

2. **[appUser] Install dependencies**  
```bash
   cd /var/www/appManager
   npm install
```

3. **[appUser] Copy `.env_example` and edit it**  
```bash
   cp .env_example .env
   nano .env
```

4. **[root] Configure NGINX using the provided example file**  
```bash
    # Copy the example configuration file
    sudo cp /var/www/appManager/nginx-example-file /etc/nginx/sites-available/appManager

    # Edit the configuration file (modify domain/URL and port [default is 9500 for appManager])
    sudo nano /etc/nginx/sites-available/appManager

    # Create a symbolic link
    sudo ln -s /etc/nginx/sites-available/appManager /etc/nginx/sites-enabled/

    # Verify NGINX configuration
    nginx -t

    # Restart NGINX
    sudo systemctl restart nginx

```

5. **[appUser] Start the application**  
```bash
    pm2 start /var/www/appManager/main.js --name appManager
    pm2 save
```

6. **[browser] Access and configure the user**  
```bash
    #Open the application in your browser.
    #Use the email configured in the appManager/.env file.
    #On the first login, the password will be saved in the appManager/.password file.
```

## Adding Projects to Manage
To add projects for management, follow these steps via SSH:

### Steps

1. **[appUser] Clone the repository**  
```bash
    cd /var/www
    #for public repositories
    git clone https://...git {folderName}
    #for private repositories
    git clone https://{TOKEN}:x-oauth-basic@{URL}.git {folderName}

```

2. **[appUser] Install dependencies**  
```bash
   idem as appManager
```

3. **[appUser] Copy `.env_example` and edit it**  
```bash
   idem as appManager
```

4. **[root] Configure NGINX using the provided example file**   
```bash
   idem as appManager
```

5. **[root] Configure NGINX using the provided example file**   
```bash
   idem as appManager
```
6. **[appUser] Edit the `.env` file of `appManager`**  
```bash
    #Open file
    nano /var/www/appManager/.env
    #Edit next line and save
    APP_NGINX_ASSOCIATION="app1 : nginxFile & app2 : nginxFile2"
    #Restart appManager
    pm2 restart appManager
```

##Now appManager is ready to manage your projects effectively!