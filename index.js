const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/SalesData", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .once("open", () => {
    console.log("CONNECTED TO MONGODB");
  })
  .on("error", (error) => {
    console.log("NOT CONNECTED", error);
  });

const dataSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  leadFirstName: String,
  leadLastName: String,
  leadEmail: String,
  leadNumber: String,
  leadCity: String,
  leadDate: String,
  leadState: String,
  leadReferredBy: String,
  leadSource: String,
  leadDescription: String,
});

const additionalDataSchema = new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  leadFirstName: String,
  leadEmail: String,
  leadPassword: String,
});

const Data = mongoose.model("leads", dataSchema);
const AdditionalData = mongoose.model("registerData", additionalDataSchema);

app.post("/register", (req, res) => {
  console.log(req.body);
  AdditionalData.findOne({ leadEmail: req.body.leadEmail })
    .then((lead) => {
      if (lead !== null) {
        res.json("email id is already registered");
      } else {
        let details = new Data(req.body);
        details
          .save()
          .then((data) => {
            let additionalDetails = new AdditionalData({
              leadId: data._id,
              leadFirstName: req.body.leadFirstName,
              leadEmail: req.body.leadEmail,
              leadPassword: req.body.leadPassword,
            });

            additionalDetails
              .save()
              .then(() => {
                res.json("Registration successful");
              })
              .catch((error) => {
                res.json(error);
              });
          })
          .catch((error) => {
            res.json(error);
          });
      }
    })
    .catch((error) => {
      res.status(500).send("Server Error");
    });
});
app.post("/login", (req, resp) => {
  AdditionalData.findOne({ leadEmail: req.body.email })
    .then((lead) => {
      if (lead) {
        if (lead.leadPassword === req.body.password) {
          resp.json({ message: "SUCCESS", user: lead });
        } else {
          resp.json({ error: "Password did not match" });
        }
      } else {
        resp.json({ error: "User not found" });
      }
    })
    .catch(() => {
      resp.status(500).json({ error: "Server Error" });
    });
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const newData = new Data(req.body);
  newData
    .save()
    .then(() => {
      console.log("Data saved successfully");
      res.end("GOT THE DATA");
    })
    .catch((error) => {
      console.error("ERROR", error);
      res.status(500).send("ERROR");
    });
});
app.get("/leads/:userId", (req, res) => {
  const userId = req.params.userId;
  Data.find({ userId })
    .then((leads) => res.json(leads))
    .catch((error) => {
      res.status(500).send("ERROR");
    });
});

app.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  Data.findOne({ _id: id })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("SERVER EDIT ERROR");
    });
});

app.put("/submit/:id", (req, res) => {
  let id = req.params.id;
  Data.updateOne({ _id: id }, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("SERVER EDIT ERROR");
    });
});

app.delete("/deleteleads/:id", (req, res) => {
  let id = req.params.id;
  Data.deleteOne({ _id: id })
    .then(() => {
      res.status(200).send("DELETED SUCCESSFULLY");
    })
    .catch((err) => {
      console.error("DELETE ERROR", err);
      res.status(500).send("ERROR DELETING");
    });
});

app.listen(3333, () => {
  console.log("PORT-NO:3333 Server Started");
});
