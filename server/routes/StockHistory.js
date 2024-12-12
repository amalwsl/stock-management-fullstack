import express from "express";
import StockHistory from "../models/StockHistory.js";
import ConsultationsHistory from "../models/ConsultationsHistory.js";

const router = express.Router();

// Dashboard Route: Overview of Stock Movements (Input/Output)
router.get("/movement/stock", async (req, res) => {
  try {
    // Fetch all stock history entries and populate related fields
    const histories = await StockHistory.find()
      .populate("partId")
      .populate("userId");

    // Create a map to store dynamic vehicle types and their movements
    const movementsMap = {};

    // Loop through the histories and categorize the inputs/outputs dynamically
    histories.forEach((history) => {
      const part = history.partId;
      const vehicleType = part.vehicleType; // Assuming 'vehicleType' is stored in the 'Part' model

      // If the vehicle type is not already in the map, initialize it
      if (!movementsMap[vehicleType]) {
        movementsMap[vehicleType] = {
          name: vehicleType,
          vehicleType: vehicleType,
          input: { piece: 0, finished: 0 },
          output: { piece: 0, finished: 0 },
        };
      }

      // Update the movements based on history type (input or output)
      if (history.type === "input") {
        movementsMap[vehicleType].input.piece += history.quantity;
        if (part.finished) {
          movementsMap[vehicleType].input.finished += history.quantity;
        }
      } else if (history.type === "output") {
        movementsMap[vehicleType].output.piece += history.quantity;
        if (part.finished) {
          movementsMap[vehicleType].output.finished += history.quantity;
        }
      }
    });

    // Convert the movements map to an array and send as the response
    const movementsArray = Object.values(movementsMap);

    res.status(200).json(movementsArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Route: Overview of consultation Movements (Input/Output)
router.get("/movement/consultation", async (req, res) => {
  try {
    // Fetch all stock history entries and populate related fields
    const histories = await ConsultationsHistory.find()
      .populate("consultationId")
      .populate("userId");

    // Create a map to store dynamic vehicle types and their movements
    const movementsMap = {};

    // Loop through the histories and categorize the inputs/outputs dynamically
    histories.forEach((history) => {
      const part = history.consultationId;
      const vehicleType = part.vehicleType; // Assuming 'vehicleType' is stored in the 'Part' model

      // If the vehicle type is not already in the map, initialize it
      if (!movementsMap[vehicleType]) {
        movementsMap[vehicleType] = {
          name: vehicleType,
          vehicleType: vehicleType,
          input: { piece: 0, finished: 0 },
          output: { piece: 0, finished: 0 },
        };
      }

      // Update the movements based on history type (input or output)
      if (history.type === "input") {
        movementsMap[vehicleType].input.piece += 1;
        if (part.finished) {
          movementsMap[vehicleType].input.finished += 1;
        }
      } else if (history.type === "output") {
        movementsMap[vehicleType].output.piece += 1;
        if (part.finished) {
          movementsMap[vehicleType].output.finished += 1;
        }
      }
    });

    // Convert the movements map to an array and send as the response
    const movementsArray = Object.values(movementsMap);

    res.status(200).json(movementsArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: View All Stock History
router.get("/stock", async (req, res) => {
  try {
    const histories = await StockHistory.find()
      .populate("partId")
      .populate("userId");
    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: View All Consultations History
router.get("/consultations", async (req, res) => {
  try {
    const histories = await ConsultationsHistory.find()
      .populate("consultationId")
      .populate("userId");
    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: View the Most Recent 10 Stock Movements
router.get("/recent/stock", async (req, res) => {
  try {
    const recentActivities = await StockHistory.find()
      .populate("partId")
      .populate("userId")
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(10); // Limit to 10 activities
    res.status(200).json(recentActivities);
  } catch (error) {
    console.error("Error fetching recent activities:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route: View the Most Recent 10 consultation Movements
router.get("/recent/consultation", async (req, res) => {
  try {
    const recentActivities = await ConsultationsHistory.find()
      .populate("consultationId")
      .populate("userId")
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(10); // Limit to 10 activities
    res.status(200).json(recentActivities);
  } catch (error) {
    console.error("Error fetching recent activities:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route: Single Stock History by ID
router.get("/stock/:id", async (req, res) => {
  try {
    const history = await StockHistory.findById(req.params.id)
      .populate("partId")
      .populate("userId");
    if (!history) return res.status(404).json({ message: "History not found" });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: Single consultation History by ID
router.get("/consultation/:id", async (req, res) => {
  try {
    const history = await ConsultationsHistory.findById(req.params.id)
      .populate("consultationId")
      .populate("userId");
    if (!history) return res.status(404).json({ message: "History not found" });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: Create New Stock History Entry (Input/Output)
router.post("/stock", async (req, res) => {
  try {
    const history = await StockHistory.create(req.body);
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route: Create New Stock History Entry (Input/Output)
router.post("/consultation", async (req, res) => {
  try {
    const history = await ConsultationsHistory.create(req.body);
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
