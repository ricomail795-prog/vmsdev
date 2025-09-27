const express = require("express");
const router = express.Router();
const db = require("../models/MaintenanceTask");

// GET all tasks
router.get("/", (req, res) => {
  db.all("SELECT * FROM maintenance_tasks", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET task by id
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM maintenance_tasks WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  });
});

// POST create task
router.post("/", (req, res) => {
  const { vesselId, task, type, scheduledDate, status, cost, notes } = req.body;
  db.run(
    "INSERT INTO maintenance_tasks (vesselId, task, type, scheduledDate, status, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [vesselId, task, type, scheduledDate, status || "pending", cost, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, vesselId, task, type, scheduledDate, status, cost, notes });
    }
  );
});

// PUT update task
router.put("/:id", (req, res) => {
  const { vesselId, task, type, scheduledDate, status, cost, notes } = req.body;
  db.run(
    "UPDATE maintenance_tasks SET vesselId=?, task=?, type=?, scheduledDate=?, status=?, cost=?, notes=? WHERE id=?",
    [vesselId, task, type, scheduledDate, status, cost, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
      res.json({ id: req.params.id, vesselId, task, type, scheduledDate, status, cost, notes });
    }
  );
});

// DELETE task
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM maintenance_tasks WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  });
});

module.exports = router;
