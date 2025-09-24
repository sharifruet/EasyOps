# Core Inventory Features – Detailed Field List

## 1. Product Catalog (SKU, barcode, category, description, price)
### 1.1 Basic Product Information
- Product ID (Auto-generated unique ID)
- SKU (Stock Keeping Unit – unique code)
- Barcode / QR Code
- Product Name
- Product Description (short + long)
- Category / Sub-Category
- Brand / Manufacturer
- Model / Variant
- Product Image(s) / Gallery
- Status (Active / Inactive / Discontinued)

### 1.2 Pricing & Costing
- Purchase Price (Cost Price)
- Selling Price (Retail Price)
- Wholesale Price
- Special / Discount Price
- Price Effective Date (from–to)
- Currency
- Tax Rate (VAT/GST %)
- Tax Type (Inclusive/Exclusive)
- Price History

### 1.3 Stock & Inventory Details
- Current Stock Quantity
- Minimum / Maximum Stock Level
- Safety Stock Level
- Stock Unit of Measure
- Warehouse / Location Assigned
- Batch / Lot Number (if applicable)
- Serial Number(s) (for electronics/machinery)
- Expiry Date / Manufacturing Date / Shelf Life
- Storage Condition (temperature, humidity)

### 1.4 Supplier & Vendor Information
- Primary Supplier Name / ID
- Supplier Contact Info
- Supplier Product Code
- Lead Time
- Supplier Pricing Agreement
- Alternate / Backup Suppliers

### 1.5 Product Variants & Configurations
- Variant Type (Size, Color, Model, Material, etc.)
- Variant SKU / Code
- Variant Price
- Variant Stock Quantity
- Attribute Set (custom fields like length, width, weight)

### 1.6 Logistics & Shipping Information
- Product Dimensions (L×W×H)
- Weight (Gross & Net)
- Packaging Type / Units per Package
- HS Code
- Country of Origin
- Shipping Restrictions (fragile, liquid, hazardous)

### 1.7 Accounting & Financial Mapping
- GL Account Code
- Cost Center
- Asset vs Expense Category
- Tax Category

### 1.8 Customer-Facing Information
- Marketing Description
- Keywords / Tags
- Product Brochure / PDF upload
- Warranty / Guarantee Info
- Return Policy

### 1.9 Compliance & Legal
- License Number / Certification
- Regulatory Documents (upload)
- Safety Instructions

### 1.10 System & Metadata
- Created By / Date
- Last Updated By / Date
- Product Lifecycle Status (New / Active / Archived)
- Internal Notes

## 2. Stock Management (Add, Update, Remove)
### 2.1 Stock Add
- Transaction ID
- Product ID / SKU / Barcode
- Quantity Added / Unit of Measure
- Warehouse / Location ID
- Batch / Lot Number
- Serial Numbers
- Supplier / Purchase Order Reference
- Cost Price per Unit / Total Value
- Expiry / Manufacturing Date
- Notes / Remarks
- Added By / Date & Time

### 2.2 Stock Update
- Transaction ID
- Product ID / SKU / Barcode
- Previous Quantity / Updated Quantity
- Adjustment Type (Increase / Decrease)
- Reason for Adjustment
- Batch / Lot / Serial Number
- Warehouse / Location ID
- Updated By / Approved By
- Date & Time / Notes

### 2.3 Stock Remove
- Transaction ID
- Product ID / SKU / Barcode
- Quantity Removed / Unit of Measure
- Warehouse / Location ID
- Batch / Lot / Serial Numbers
- Removal Reason / Linked Sales Order / Invoice
- Cost Price / Stock Value Reduced
- Removed By / Approved By
- Date & Time / Notes

### 2.4 Common System Features
- Audit Trail: Audit ID, Transaction ID, Action Type, Product ID / SKU, Previous & New Value, User ID / Role, Timestamp, Device/IP, Remarks
- Approval Workflow: Approval ID, Transaction ID, Requested By, Approver ID, Status, Approval Date, Comments, Escalation Level
- Real-Time Updates: Update ID, Transaction ID, Product ID, Previous & Updated Quantity, Warehouse, Sync Status / Timestamp, Triggered By
- Multi-Warehouse Support: Transfer ID, Transaction ID, Product ID, Source / Destination Warehouse, Quantity, Status, Approved By, Transport Info
- Notification Alerts: Alert ID, Transaction ID, Product ID, Alert Type / Level, Recipient, Delivery Method, Status, Timestamp
- Integration: Integration ID, Transaction ID, Source / Destination Module, Method, Status, Timestamp, Error Log

## 3. Multi-Warehouse / Multi-Location Stock Tracking
### 3.1 Warehouse / Location Master
- Warehouse ID, Name, Code, Type, Address, GPS, Contact, Capacity, Temperature Control, Status, Created/Updated By & Date

### 3.2 Stock by Warehouse
- Stock Entry ID, Product ID, Warehouse, Current / Reserved / Available Quantity, Min/Max Level, Reorder Point, Batch / Lot, Expiry, Last Updated By/Date

### 3.3 Stock Transfer
- Transfer ID, Product ID, Source / Destination, Quantity, Status, Date & Time, Transport / Vehicle Details, Approved By, Notes

### 3.4 Stock Adjustment per Location
- Adjustment ID, Product ID, Warehouse, Previous / Adjusted Quantity, Adjustment Type, Reason, Approved By, Date & Time, Notes

### 3.5 Warehouse-Level Reporting
- Stock Summary, Stock Movement, Low Stock, Expiry, Dead Stock, Capacity Utilization

### 3.6 User & Access Control
- Access ID, User ID, Warehouse(s), Access Level, Role, Effective Date

### 3.7 Integration
- Integration ID, Source / Destination Module, Sync Type, Status, Timestamp, Error Log

## 4. Real-Time Stock Updates
- Transaction Trigger ID, Type, Linked Transaction, Source Module, Triggered By, Timestamp
- Product Stock Update: Update ID, Product, Previous / Updated Quantity, Change, Warehouse, Batch / Serial, Status, Timestamp
- Sync Across Locations: Sync ID, Product, Source / Destination, Type, Status, Timestamp, Error Log
- Integration: Integration ID, Product, Linked Transaction / Accounting Entry / POS ID, API Log, Status, Timestamp
- Notification & Alerts: Alert ID, Product, Transaction, Type, Recipient, Delivery Method, Status, Timestamp
- Audit Trail: Audit ID, Update ID, Product, Action, Previous → New Quantity, User, Role, Device/IP, Timestamp, Remarks

## 5. Batch & Lot Tracking
- Batch / Lot Master: Batch ID, Product, Number, Manufacturing / Expiry, Quantity, Unit, Warehouse, Status, Supplier, Storage, Created/Updated
- Batch Stock Details: Stock ID, Batch ID, Product, Warehouse, Current / Reserved / Available / Damaged / Quarantined Qty, Cost, Value, Last Updated
- Expiry Management: Alert ID, Batch, Product, Expiry, Days to Expiry, Level, Recipient, Method, Status, Timestamp
- Batch Movement Tracking: Movement ID, Batch, Product, Transaction Type & ID, Warehouse, Quantity, Date, User, Notes
- Reports: Stock Summary, Expiry, Batch Movement, Slow/Dead Stock, Cost & Profit Analysis
- Integration: Batch ID, Product, Linked Transaction, Destination Module, Status, Timestamp, Error Log

## 6. Serial Number Tracking
- Serial Master: Serial ID, Product, Serial Number, Batch, Manufacturing, Warranty, Status, Supplier, Warehouse, Created/Updated
- Serial Stock Details: Stock ID, Serial ID, Product, Warehouse, Status, Assigned To, Cost / Selling Price, Last Updated
- Movement Tracking: Movement ID, Serial ID, Product, Transaction Type / ID, Warehouse Source/Dest, Date, User, Notes
- Warranty & Service: Serial ID, Warranty Start/End, Service Contract, Service History, Customer, Status, Provider, Notes
- Reports: Serial Stock Summary, Sold / Delivered, Warranty Expiry, Movement History, Damaged / Returned
- Integration: Serial ID, Product, Linked Transaction, Destination Module, Status, Timestamp, Error Log

## 7. Reorder Level Alerts
- Reorder Level Master: ID, Product, Warehouse, Min / Max / Safety Level, Unit, Created/Updated
- Stock Monitoring: Monitoring ID, Product, Warehouse, Current / Reserved / Available Quantity, Reorder Level, Status, Last Checked
- Alert Configuration: Alert ID, Product, Warehouse, Type, Threshold, Recipient, Delivery Method, Priority, Status, Timestamp
- Automated Purchase Trigger: Trigger ID, Product, Warehouse, Current Qty, Reorder Qty, Linked PO, Status, Timestamp
- Reports: Low / Critical Stock, Alerts History, Reorder Suggestion, Stock Trend Analysis
- Integration: Product, Linked Transaction, Destination Module, Status, Timestamp, Error Log

## 8. Stock Transfers
- Transfer Master: ID, Reference No, Source / Destination, Date, Requested / Approved By, Status, Type, Notes, Created/Updated
- Transfer Item Details: Item ID, Transfer ID, Product, Batch / Serial, Qty, Unit, Cost, Total Value, Status, Notes
- Approval Workflow: Approval ID, Transfer ID, Requested / Approver ID, Status, Date, Comments
- Movement Tracking: Movement ID, Transfer ID, Product, Source / Dest, Qty, Dispatch / Received Date, Transport / Vehicle, Status, Notes
- Notification / Alerts: Alert ID, Transfer ID, Product, Type, Recipient, Method, Status, Timestamp
- Reports: Transfer Summary, Product Movement, Pending / Delayed Transfers, Cost Analysis
- Integration: Transfer ID, Linked Transaction, Destination Module, Status, Timestamp, Error Log

## 9. Inventory Valuation
- Valuation Methods: ID, Name (FIFO/LIFO/Weighted Average), Product, Warehouse, Effective Date, Status, Created/Updated
- Stock

