# Lets-Chat

## Steps to setup

1. First of all clone this repository into your local machine.
2. Separate Frontend directory and move it to ***/var/www/html*** directory (For Linux users).
3. Create a MySQL database named ***ChatApp*** or any other of your choice.
4. Create ***.env*** file inside Backend directory and setup environment variables as shown in ***.env.sample***.
5. Start the Node Server on your defined port -
    => Run command: 
        ```
        npm run dev
        ```
6. In Frontend directory create ***config.js*** and setup configs as shown in ***sample.config.js***.
    * Set HTTP_URL as your Node server host and port:
        ```
        http://<host>:<port>
        ```
    * Set WS_URL as your Node server's host and ***8083*** port:
        ```
        ws://<host>:8083
        ```
7. Now you are good to go. Simply run index.html file from your localhost.