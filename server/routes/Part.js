import express from "express";
import Part from "../models/Part.js";
import consultation from "../models/consultation.js";

const router = express.Router();

// Vehicle types to track for the stock movement chart
export const vehicleTypes = [
  "Voiture", // Cars often use turbochargers.
  "Camion", // Trucks frequently require turbos.
  "Moto", // Some motorcycles use turbos for enhanced performance.
  "Avion", // Aircraft engines, especially jets, often use turbo technology.
  "Bateau", // Some boats, particularly speedboats, may have turbos.
  "Tracteur", // Turbochargers are common in tractors for power in agriculture.
  "Bus", // Many buses use turbochargers for efficiency and power.
  "Taxi", // Taxis may use turbo engines for fuel efficiency in urban environments.
  "Remorque", // Trucks pulling trailers often rely on turbocharged engines.
];

// Create a new part
router.post("/", async (req, res) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json(part);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all parts
router.get("/", async (req, res) => {
  try {
    const parts = await Part.find();
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats of parts
router.get("/stats", async (req, res) => {
  try {
    const totalParts = await Part.countDocuments();
    const totalConsultation = await consultation.countDocuments();
    const lowStockItems = await Part.countDocuments({ quantity: { $lt: 5 } });
    const partsAdded30d = await Part.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });
    const partsUpdated30d = await Part.countDocuments({
      updatedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });

    res.status(200).json({
      totalParts,
      totalConsultation,
      lowStockItems,
      partsAdded30d,
      partsUpdated30d,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parts with quantity less than 10
router.get("/lowStock", async (req, res) => {
  try {
    const lowStockParts = await Part.find({ quantity: { $lt: 10 } });
    res.status(200).json(lowStockParts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single part by ID
router.get("/:id", async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a part
router.put("/:id", async (req, res) => {
  if (!req.body.updatedBy) {
    req.body.updatedBy = null;
  }

  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.status(200).json(part);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a part
router.delete("/:id", async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.status(200).json({ message: "Part deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
