# Lets-Chat

### Dependencies: 
* Following should be pre-installed in your PC in order to run this app
    * Node JS
    * MySQL
    * Apache

- To install dependencies you can follow these links:
    - https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-22-04
    - https://nodejs.org/en/download/package-manager/

## Steps to setup

1. First of all clone this repository into your local machine.
2. Separate Frontend directory and move it to ***/var/www/html*** directory (For Linux users).
3. Create a MySQL database named ***ChatApp*** or any other of your choice.
4. Create ***.env*** file inside Backend directory and setup environment variables as shown in ***.env.sample***.
5. Install all backend dependencies by running following command
    ```
    npm install
    ```
6. Run migrations to create tables in database. Run following command:
    ```
    npx sequelize-cli db:migrate
    ```
6. Start the Node Server on your defined port by running following command: 
    ```
    npm run dev
    ```
7. In Frontend directory create ***config.js*** and setup configs as shown in ***sample.config.js***.
    * Set HTTP_URL as your Node server host and port:
        ```
        http://<host>:<port>
        ```
    * Set WS_URL as your Node server's host and ***8083*** port:
        ```
        ws://<host>:8083
        ```
8. Now you are good to go. Simply run **index.html** file from your localhost.