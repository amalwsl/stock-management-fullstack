import express from "express";
import Consultation from "../models/consultation.js";

const router = express.Router();

// Vehicle types to track for the stock movement chart
export const vehicleTypes = [
  "Voiture",
  "Camion",
  "Moto",
  "Avion",
  "Bateau",
  "Tracteur",
  "Bus",
  "Taxi",
  "Remorque",
];

// Create a new consultation
router.post("/", async (req, res) => {
  try {
    const newConsultation = await Consultation.create(req.body);
    res.status(201).json(newConsultation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all consultations
router.get("/", async (req, res) => {
  try {
    const consultations = await Consultation.find();
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats of consultations
router.get("/stats", async (req, res) => {
  try {
    const totalConsultations = await Consultation.countDocuments();
    const lowStockItems = await Consultation.countDocuments({
      quantity: { $lt: 5 },
    });
    const consultationsAdded30d = await Consultation.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });
    const consultationsUpdated30d = await Consultation.countDocuments({
      updatedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });

    res.status(200).json({
      totalConsultations,
      lowStockItems,
      consultationsAdded30d,
      consultationsUpdated30d,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consultations with quantity less than 10
router.get("/lowStock", async (req, res) => {
  try {
    const lowStockConsultations = await Consultation.find({
      quantity: { $lt: 10 },
    });
    res.status(200).json(lowStockConsultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a single consultation by ID
router.get("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a consultation
router.put("/:id", async (req, res) => {
  if (!req.body.updatedBy) {
    req.body.updatedBy = null;
    console.log("updated by is null");
  }

  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json(consultation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a consultation
router.delete("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
