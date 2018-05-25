# WXR Space Server #

The Webized X Reality Space Web Service


## Features ##

## Quickstart ##

### Install Redis ###
Currently, This use Redis as database.
1. Get the Redis
    * Unix/Linux: https://redis.io/download
    * Windows(x64): https://github.com/MicrosoftArchive/redis/releases (ported by Microsoft Open Tech Group)
2. Move downloaded redis folder under repository root. Then the path looks like `./wxr-space-server/redis`.

### Run ###
1. Install dependent node modules `npm install`.
2. Start Server `npm start`.
3. Run redis-server using script.
    * Unix/Linux: Execute command `~$ bash run_redis-server.bat`
    * Windwos(x64): Execute `run_redis-server.bat` batch file.
