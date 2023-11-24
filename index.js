import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

const portNumber = 4000;
app.listen(portNumber);
console.log(`Ìs working on port: ${portNumber}`);
