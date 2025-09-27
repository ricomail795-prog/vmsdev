Backend Maintenance Addon Instructions
======================================

1. Copy `models/MaintenanceTask.js` into your existing backend/models/ folder.
2. Copy `routes/maintenance.js` into your existing backend/routes/ folder.
3. Place `database.sqlite` into your backend/ folder.
4. Edit your `server.js` and add:

   const maintenanceRoutes = require("./routes/maintenance");
   app.use("/api/maintenance", maintenanceRoutes);

5. Run your backend as usual (`npm start` or `node server.js`).

## Test with curl:

List all tasks:
  curl http://localhost:8000/api/maintenance

Add a new task:
  curl -X POST http://localhost:8000/api/maintenance     -H "Content-Type: application/json"     -d '{"vesselId":"MV Neptune","task":"Inspect lifeboat davits","type":"Routine","scheduledDate":"2025-09-30","status":"Pending","cost":300}'

Update a task (id=1):
  curl -X PUT http://localhost:8000/api/maintenance/1     -H "Content-Type: application/json"     -d '{"status":"Completed"}'

Delete a task (id=2):
  curl -X DELETE http://localhost:8000/api/maintenance/2
