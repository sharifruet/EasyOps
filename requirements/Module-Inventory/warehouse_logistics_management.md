## 🔹 4. Warehouse & Logistics

### 4.1 Warehouse / Location Master
- Warehouse ID (auto-generated unique ID)
- Warehouse Name / Code
- Location Type (Warehouse / Store / Distribution Center / Cold Storage)
- Address (Street, City, State, Country, Zip Code)
- GPS Coordinates (Latitude / Longitude)
- Contact Person / Phone / Email
- Storage Capacity (Volume / Quantity / Pallets)
- Temperature Control (Yes / No)
- Status (Active / Inactive)
- Created By / Date
- Last Updated By / Date

### 4.2 Warehouse Zones / Racks / Bins
- Zone / Rack / Bin ID (auto-generated)
- Warehouse ID (linked)
- Zone / Rack / Bin Code / Name
- Max Capacity
- Status (Active / Inactive)
- Notes / Remarks
- Created By / Date
- Last Updated By / Date

### 4.3 Inventory Storage Mapping
- Mapping ID (auto-generated)
- Product ID / SKU
- Warehouse ID / Zone / Rack / Bin
- Quantity Stored
- Batch / Lot Number (if applicable)
- Serial Numbers (if applicable)
- Status (Available / Reserved / Damaged / Quarantined)
- Last Updated By / Date

### 4.4 Inbound Logistics / Receiving
- Inbound ID (auto-generated)
- Supplier ID / Shipment ID / PO ID
- Expected Arrival Date / Time
- Received Date / Time
- Warehouse / Location ID
- Carrier / Courier Details
- Goods Condition Status (Good / Damaged / Expired)
- Received By
- Notes / Remarks

### 4.5 Outbound Logistics / Dispatch
- Outbound ID (auto-generated)
- SO ID / Customer ID / Shipment ID
- Dispatch Date / Time
- Warehouse / Location ID
- Carrier / Courier / Vehicle Details
- Tracking Number
- Shipped By / Received By
- Status (Pending / In Transit / Delivered / Returned)
- Notes / Remarks

### 4.6 Stock Transfer Between Locations
- Transfer ID (auto-generated)
- Product ID / SKU
- Source Warehouse / Location ID
- Destination Warehouse / Location ID
- Quantity Transferred / Unit
- Batch / Lot / Serial Numbers
- Transfer Date / Time
- Transfer Status (Pending / In Transit / Completed)
- Transport / Vehicle / Driver Details
- Approved By / Requested By
- Notes / Remarks

### 4.7 Logistics Partners / Carriers Master
- Carrier ID (auto-generated)
- Carrier Name / Code
- Contact Person / Phone / Email
- Transport Type (Truck / Courier / Air / Sea)
- Status (Active / Inactive)
- Notes / Remarks
- Created By / Date
- Last Updated By / Date

### 4.8 Returns & Reverse Logistics
- Return ID (auto-generated)
- Original SO / Shipment ID
- Customer ID / Supplier ID
- Return Date / Time
- Warehouse / Location ID
- Product Details (Product ID / SKU, Quantity, Batch / Lot / Serial Numbers)
- Condition Status (Good / Damaged / Expired)
- Reason for Return
- Processed By / Approved By
- Notes / Remarks

### 4.9 Reporting & Analytics
- Warehouse Stock Summary Report
- Zone / Rack / Bin Utilization Report
- Inbound / Outbound Shipment Report
- Transfer / Movement History Report
- Returns / Reverse Logistics Report
- Warehouse Capacity Utilization
- Logistics Partner Performance

### 4.10 Integration with Other Modules
- Integration ID (auto-generated)
- Linked IDs (Stock, PO, SO, Shipment, Transfer, Return)
- Destination Module (Inventory, Purchasing, Sales, Accounting, ERP)
- Sync Status (Success / Failed / Pending)
- Sync Timestamp
- Error Log

