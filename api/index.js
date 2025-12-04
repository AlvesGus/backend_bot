import express from "express";
import cors from "cors";
import { prisma } from "../lib/prisma.js";
import "dotenv/config";
import { category } from "@prisma/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/api/health", (req, res) => {
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
    res.status(500).send({ error: "Failed to fetch transactions" });
  }
});

app.post("/api/add-transaction", async (req, res) => {
  const { title, amount, type, category, telegram_id, name_user } = req.body;
  try {
    const data = await prisma.transaction.create({
      data: { title, amount, type, category, telegram_id, name_user },
    });

    res.status(201).send({ message: "Transaction added successfully", data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to add transaction" });
  }
});

app.get("/api/balance", async (req, res) => {
  try {
    const revenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: "Entrada",
      },
    });

    const expense = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: "Saida",
      },
    });

    const revenues = revenue._sum.amount || 0;
    const expenses = expense._sum.amount || 0;

    const balance = revenues - expenses;

    res.status(200).send({
      entradas: revenues,
      saídas: expenses,
      saldo: balance,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Erro! Impossível calcular" });
  }
});

app.get("/api/balance/period", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).send({
        message: "Você deve enviar uma data de início e fim.",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const entradas = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: "Entrada",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const saidas = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: "Saida",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalEntradas = entradas._sum.amount || 0;
    const totalSaidas = saidas._sum.amount || 0;
    const saldo = totalEntradas - totalSaidas;

    res.status(200).json({
      start: startDate,
      end: endDate,
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Erro! Impossível calcular" });
  }
});

app.get("/api/investment", async (req, res) => {
  try {
    const investments = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { category: "Investimento" }
    });

    const invested = Number(investments._sum.amount) || 0;

    return res.status(200).json({ 
      Investimentos: {
        investido: invested,
      }
      
      
     });

  } catch (error) {
    console.error("Erro ao buscar investimento:", error);
    return res.status(500).json({
      message: "Erro ao buscar os dados de investimento."
    });
  }
});


app.delete("/api/delete-transaction/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.transaction.delete({
      where: { id: String(id) },
    });

    res.status(200).send({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to delete transaction" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
