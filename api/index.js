import express from "express";
import cors from "cors";
import { prisma } from "../lib/prisma.js";
import {dotenv} from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/health", (req, res) => {
  res.status(200).send({ message: "API is healthy" });
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).send(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).send({error: "Failed to fetch transactions"});
  }
});

app.post("/api/add-transaction", async (req, res) => {

})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
