import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/**
 * Create a new vehicle
 */
router.post("/", async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ message: "Vehicle created successfully", vehicle });
  } catch (error) {
    const errors = Object.values(error.errors || {}).map((err) => err.message);
    res.status(400).json({ error: errors.length ? errors : error.message });
  }
});

/**
 * Read all vehicles with optional filtering, sorting, and pagination
 */
router.get("/", async (req, res) => {
  const { type, sort, page = 1, limit = 10 } = req.query;

  try {
    const query = type ? { type } : {};
    const vehicles = await Vehicle.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort || "name");

    const total = await Vehicle.countDocuments(query);

    res
      .status(200)
      .json({ total, page: parseInt(page), limit: parseInt(limit), vehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get vehicle type statistics for dashboard charts
 */
router.get("/vehicleTypes", async (req, res) => {
  try {
    const typeStats = await Vehicle.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.status(200).json(typeStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Read a single vehicle by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

/**
 * Update a vehicle by ID
 */
router.put("/:id", async (req, res) => {
  const updates = req.body;

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No updates provided" });
  }

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle updated successfully", vehicle });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Delete a vehicle by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

export default router;
