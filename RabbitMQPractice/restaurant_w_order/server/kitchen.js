#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

// Get food items the kitchen can cook from command-line arguments
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: kitchen.js [food_item] [food_item] ...");
  process.exit(1);
}

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const exchange = "order_exchange";
    channel.assertExchange(exchange, "direct", {
      durable: true,
    });

    args.forEach(function (foodItem) {
      const queue = foodItem;

      channel.assertQueue(queue, {
        durable: true,
      });

      channel.bindQueue(queue, exchange, foodItem);

      channel.consume(
        queue,
        function (msg) {
          console.log(
            " [x] Kitchen received order '%s':'%s'",
            msg.fields.routingKey,
            msg.content.toString()
          );
          const order = JSON.parse(msg.content);

          // Simulate cooking time (e.g., 1 second per quantity)
          const cookingTime = order.quantity * 1000;
          setTimeout(function () {
            console.log(
              ` [x] Finished cooking ${order.quantity} ${order.name}(s)`
            );
            channel.ack(msg);
          }, cookingTime);
        },
        {
          noAck: false,
        }
      );
    });

    console.log(
      " [*] Kitchen waiting for orders for items: %s. To exit press CTRL+C",
      args.join(", ")
    );
  });
});
