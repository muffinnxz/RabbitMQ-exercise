// client/index.js

const client = require("./client");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib/callback_api");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  client.getAllMenu(null, (err, data) => {
    if (!err) {
      res.render("menu", {
        results: data.menu,
      });
    }
  });
});

app.post("/placeorder", (req, res) => {
  const orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  // Send the order message to RabbitMQ using a topic exchange
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = "order_exchange";
      const routingKey = req.body.name; // Use the food item's name as the routing key

      channel.assertExchange(exchange, "topic", {
        durable: true,
      });
      channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(orderItem)),
        {
          persistent: true,
        }
      );
      console.log(" [x] Sent '%s':'%s'", routingKey, JSON.stringify(orderItem));
      setTimeout(function () {
        connection.close();
      }, 500);
    });
  });
  res.send("Order placed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
