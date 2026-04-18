db = db.getSiblingDB("admin");

const config = {
  _id: "rs0",
  members: [{ _id: 0, host: "mongo:27017" }],
};

const maxAttempts = 60;
let attempt = 0;

while (true) {
  try {
    const result = rs.initiate(config);
    printjson(result);
    break;
  } catch (error) {
    printjson(error);
    attempt += 1;
    if (attempt >= maxAttempts) {
      throw new Error("rs.initiate failed after max retries");
    }
    sleep(1000);
  }
}
