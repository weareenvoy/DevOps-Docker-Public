const dgram = require("dgram");

const PORT = 9000;
const HOST = "127.0.0.1";

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log("Pass a single string as the message to be sent.");
  process.exit(1);
}

const message = new Buffer.from(args[0], "utf8");

const client = dgram.createSocket("udp4");

setInterval(() => {
  client.send(message, 0, message.length, PORT, HOST, function (err) {
    if (err) {
      client.close();
      throw err;
    }

    console.log(`Message sent to ${HOST}:${PORT}: "${message}"`);
  });
}, 1000);
