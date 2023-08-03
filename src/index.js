require("dotenv").config({ path: `${__dirname}/.env` });
const express = require("express");
const stripe = require("stripe")(process.env.API_KEY);
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("I am god");
});

app.get("/config", async (req, res) => {
  return res.send({
    publishableKey: process.env.PUBLISHABLE_KEY,
  });
});

//

let actualItems = {
  sTRGZEOgTee: "price_1NaHTSDurtyT6kdC0yq1A8gJ",
  cMWYSTee: "price_1NaHSADurtyT6kdCLCP5hrXF",
};

app.post("/create-payment-intent", async (req, res) => {
  let items = req.body;
  let email = req.body.email;

  // Verify the items
  for (let i = 0; i < items.length; i++) {
    if (!Object.values(actualItems).includes(items[i].uuid)) {
      return res.sendStatus(400);
    }
  }

  // verify the quantites
  for (let i = 0; i < items.length; i++) {
    if (items[i].qty <= 0) {
      return res.sendStatus(400);
    }
  }

  // Do the math for the amount
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].qty * 50;
  }

  total += total * 0.15;

  total += 10;
  total = Math.ceil(total);
  total *= 100;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "NZD",
      amount: total,
      automatic_payment_methods: { enabled: true },
      description: JSON.stringify(req.body),
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
