// client/test.js

const amqp = require("amqplib/callback_api");

function sendOrder(orderItem) {
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      const exchange = "order_exchange";
      const routingKey = orderItem.name;

      channel.assertExchange(exchange, "direct", {
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
      console.log(
        " [x] Sent order to '%s' exchange with routing key '%s': '%s'",
        exchange,
        routingKey,
        JSON.stringify(orderItem)
      );
      setTimeout(function () {
        connection.close();
      }, 500);
    });
  });
}

// List of orders to send
const orders = [
  { id: "1", name: "Fried rice", quantity: 1 },
  { id: "2", name: "Pad-Thai", quantity: 2 },
  { id: "3", name: "Somtam", quantity: 3 },
  { id: "4", name: "Tomyam Gung", quantity: 1 },
  { id: "5", name: "Pad-Thai", quantity: 1 },
];

orders.forEach(function (order) {
  sendOrder(order);
});
