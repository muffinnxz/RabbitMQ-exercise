const PROTO_PATH = "../restaurant.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

// Load the package definition and get the restaurant service
const restaurantProto =
  grpc.loadPackageDefinition(packageDefinition).RestaurantService;

const client = new restaurantProto(
  "localhost:30043",
  grpc.credentials.createInsecure()
);

module.exports = client;
