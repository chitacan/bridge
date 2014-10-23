# bridge

Extend your adb connection to wherever you want.

## What is it?

## Install

```
$ npm install -g bridge-tool
```

## Start Server

Run `bridge` with flag `-s`.

```
$ bridge -s
$ PORT=1234 bridge -s
```

Now your bridge client & [bridge app](https://github.com/chitacan/bridge-app) can connect to server.

## Connect to Server

Just run `bridge` with server url.

```
$ bridge -u <url>
```

## Usage

```
  Usage: bridge [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -s, --server          run server mode
    -u, --url <url>       specify server url to connect (client mode only)
    -p, --port <port>     specify port number to listen (client mode only)
    -a, --adbPort <port>  specify adb server port number to connect (client mode only)
```

## Deploy to Heroku

No server? you can deploy the server to heroku. Just hit the `button`. :lipstick:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/chitacan/bridge)

## License

MIT
