import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Part from "./models/Part.js";
import StockHistory from "./models/StockHistory.js";
import Vehicle from "./models/Vehicle.js";
import Consultation from "./models/consultation.js";
import ConsultationsHistory from "./models/ConsultationsHistory.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost/crm-stock"
    );

    // Clear existing collections
    await User.deleteMany({});
    await Part.deleteMany({});
    await StockHistory.deleteMany({});
    await ConsultationsHistory.deleteMany({});
    await Vehicle.deleteMany({});
    await Consultation.deleteMany({});

    // Seed Users
    const [admin, employee] = await User.create([
      {
        username: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
      {
        username: "Employee User",
        email: "employee@example.com",
        password: "employee123",
        role: "employee",
      },
    ]);
    console.log("Default users created successfully");

    // Seed consultations
    const consultations = await Consultation.create([
      {
        reference: "REF001",
        referenceOrg: "ORG001",
        vehicleType: "Car",
        turboType: "Garrett GT1544",
        model: "BMW 320d",
        description: "Turbocharger needs inspection for oil leakage.",
        size: "Small",
        image: "image_url_1",
        updatedBy: admin._id,
        state: "Pièce",
        receptionDate: "2024-12-01",
        issueDate: "2024-12-05",
        isFixed: "Non Réparé",
      },
      {
        reference: "REF002",
        referenceOrg: "ORG002",
        vehicleType: "Truck",
        turboType: "Holset HX35W",
        model: "Mack CHU613",
        description: "Turbocharger requires balancing due to vibrations.",
        size: "Medium",
        image: "image_url_2",
        updatedBy: admin._id,
        state: "Turbo terminé",
        receptionDate: "2024-11-25",
        issueDate: "2024-12-02",
        isFixed: "Réparé",
      },
      {
        reference: "REF003",
        referenceOrg: "ORG003",
        vehicleType: "Car",
        turboType: "BorgWarner K04",
        model: "Audi A3",
        description: "Turbocharger has excessive play and needs replacement.",
        size: "Medium",
        image: "image_url_3",
        updatedBy: admin._id,
        state: "Pièce",
        receptionDate: "2024-12-03",
        issueDate: "2024-12-04",
        isFixed: "Non Réparé",
      },
      {
        reference: "REF004",
        referenceOrg: "ORG004",
        vehicleType: "Motorcycle",
        turboType: "Mitsubishi TD04L",
        model: "Suzuki Hayabusa",
        description:
          "Turbocharger is making unusual noises and requires inspection.",
        size: "Small",
        image: "image_url_4",
        updatedBy: admin._id,
        state: "Turbo terminé",
        receptionDate: "2024-12-01",
        issueDate: "2024-12-06",
        isFixed: "Réparé",
      },
    ]);

    console.log("Consultations created successfully");

    // Seed Vehicles
    await Vehicle.create([
      { type: "Voiture", name: "Renault Clio", model: "RS", year: 2020 },
      {
        type: "Camion",
        name: "Mercedes-Benz Actros",
        model: "MP5",
        year: 2021,
      },
      { type: "Moto", name: "Kawasaki Ninja", model: "ZX-10R", year: 2019 },
      { type: "Avion", name: "Cessna 172", model: "Skyhawk", year: 2022 },
      { type: "Bateau", name: "Yamaha AR210", model: "Jet Boat", year: 2023 },
      { type: "Tracteur", name: "John Deere 8R", model: "410", year: 2020 },
      { type: "Bus", name: "Volvo 9700", model: "Luxury Coach", year: 2021 },
      { type: "Taxi", name: "Toyota Prius", model: "Hybrid", year: 2022 },
      {
        type: "Remorque",
        name: "Schmitz Cargobull",
        model: "S.KO COOL",
        year: 2023,
      },
    ]);
    console.log("Vehicles created successfully");

    // Seed Parts
    const parts = await Part.create([
      {
        reference: "11111-V",
        referenceOrg: "22222-W",
        vehicleType: "Voiture",
        turboType: "Turbocharger",
        model: "Renault Clio RS",
        description: "High-performance turbocharger for Renault Clio RS 2020",
        quantity: 10,
        size: "Compact",
        image: "https://example.com/images/clio-turbo.jpg",
        updatedBy: admin._id,
        state: "Turbo terminé",
      },
      {
        reference: "33333-X",
        referenceOrg: "44444-Y",
        vehicleType: "Camion",
        turboType: "Intercooler",
        model: "Mercedes-Benz Actros MP5",
        description: "Heavy-duty intercooler for Mercedes-Benz Actros 2021",
        quantity: 5,
        size: "Large",
        image: "https://example.com/images/actros-intercooler.jpg",
        updatedBy: employee._id,
        state: "Pièce",
      },
      {
        reference: "55555-Z",
        referenceOrg: "66666-AA",
        vehicleType: "Moto",
        turboType: "Exhaust Turbo",
        model: "Kawasaki Ninja ZX-10R",
        description: "Exhaust turbo system for Kawasaki Ninja ZX-10R 2019",
        quantity: 7,
        size: "Small",
        image: "https://example.com/images/ninja-exhaust-turbo.jpg",
        updatedBy: admin._id,
        state: "Pièce",
      },
      {
        reference: "77777-BB",
        referenceOrg: "88888-CC",
        vehicleType: "Avion",
        turboType: "Turbo Propeller",
        model: "Cessna 172 Skyhawk",
        description: "Turbo propeller for Cessna 172 2022",
        quantity: 3,
        size: "Large",
        image: "https://example.com/images/cessna-turbo-propeller.jpg",
        updatedBy: admin._id,
        state: "Turbo terminé",
      },
      {
        reference: "99999-DD",
        referenceOrg: "00000-EE",
        vehicleType: "Bateau",
        turboType: "Jet Turbo",
        model: "Yamaha AR210 Jet Boat",
        description: "Turbo system for Yamaha AR210 2023",
        quantity: 2,
        size: "Medium",
        image: "https://example.com/images/jet-boat-turbo.jpg",
        updatedBy: employee._id,
        state: "Turbo terminé",
      },
    ]);
    console.log("Parts created successfully");

    // Create some seed history records
    await ConsultationsHistory.create([
      {
        consultationId: consultations[0]._id, // Corrected
        userId: admin._id,
        type: "input",
        quantity: 10,
        notes: "Initial stock entry for consultation 1",
      },
      {
        consultationId: consultations[1]._id, // Corrected
        userId: admin._id,
        type: "output",
        quantity: 5,
        notes: "Consultation 2 stock removed",
      },
      {
        consultationId: consultations[2]._id, // Corrected
        userId: admin._id,
        type: "update",
        quantity: 2,
        notes: "Updated stock count for consultation 3",
      },
      {
        consultationId: consultations[3]._id, // Corrected
        userId: admin._id,
        type: "delete",
        quantity: 3,
        notes: "Deleted outdated stock for consultation 4",
      },
    ]);

    // Seed Stock History
    await StockHistory.create([
      {
        partId: parts[0]._id,
        userId: admin._id,
        type: "input",
        quantity: 5,
        notes: "Added turbochargers for Renault Clio",
      },
      {
        partId: parts[1]._id,
        userId: employee._id,
        type: "output",
        quantity: 2,
        notes: "Used intercoolers for Mercedes-Benz Actros",
      },
      {
        partId: parts[2]._id,
        userId: admin._id,
        type: "input",
        quantity: 3,
        notes: "Restocked exhaust turbos for Kawasaki Ninja",
      },
      {
        partId: parts[3]._id,
        userId: admin._id,
        type: "output",
        quantity: 1,
        notes: "Used turbo propeller for Cessna 172",
      },
      {
        partId: parts[4]._id,
        userId: employee._id,
        type: "input",
        quantity: 1,
        notes: "Added jet turbo system for Yamaha AR210",
      },
    ]);
    console.log("Stock history created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
