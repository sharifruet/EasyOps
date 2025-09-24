## 🔹 2. Purchasing & Supplier Management

### 2.1 Supplier Master
- Supplier ID (auto-generated unique ID)
- Supplier Name / Company
- Supplier Code
- Contact Person
- Email / Phone / Fax
- Address (Street, City, State, Country, Zip Code)
- GST / VAT Number
- Payment Terms
- Lead Time (days)
- Supplier Type (Manufacturer / Distributor / Wholesaler)
- Status (Active / Inactive)
- Created By / Created Date
- Last Updated By / Date

### 2.2 Supplier Products
- Supplier Product ID
- Supplier ID (linked)
- Product ID / SKU
- Supplier SKU / Code
- Unit Price / Currency
- MOQ (Minimum Order Quantity)
- Lead Time
- Tax Rate / Type
- Status (Active / Inactive)
- Created By / Updated By / Date

### 2.3 Purchase Orders (PO)
- PO ID (auto-generated)
- PO Number
- Supplier ID
- Order Date / Expected Delivery Date
- Status (Draft / Confirmed / Partially Received / Completed / Cancelled)
- Ordered By / Approved By
- Total Amount / Currency / Tax
- Payment Terms
- Notes / Remarks

### 2.4 Purchase Order Items
- PO Item ID
- PO ID (linked)
- Product ID / SKU
- Quantity Ordered / Unit of Measure
- Unit Price / Tax / Discount
- Expected Delivery Date
- Received Quantity
- Status (Pending / Received / Partially Received / Cancelled)
- Notes / Remarks

### 2.5 Goods Receipt / GRN (Goods Received Note)
- GRN ID (auto-generated)
- PO ID (linked)
- GRN Number
- Received Date / Time
- Warehouse / Location ID
- Received By
- Product Details (Product ID / SKU, Quantity Received, Unit, Batch / Lot / Serial Numbers)
- Condition Status (Good / Damaged / Expired)
- Notes / Remarks

### 2.6 Supplier Invoices
- Invoice ID (auto-generated)
- Invoice Number
- Supplier ID / PO ID
- Invoice Date / Due Date
- Amount / Currency / Tax
- Payment Status (Pending / Paid / Partially Paid / Overdue)
- Notes / Remarks

### 2.7 Supplier Payments
- Payment ID (auto-generated)
- Invoice ID / Supplier ID
- Payment Date / Time
- Amount Paid / Currency
- Payment Method (Bank Transfer / Cash / Cheque / Online)
- Payment Reference / Transaction ID
- Approved By / Processed By
- Notes / Remarks

### 2.8 Supplier Performance Tracking
- Performance ID (auto-generated)
- Supplier ID
- Delivery Timeliness (On-time %, Delayed Orders)
- Quality Score (Defective %)
- Compliance Rating
- Notes / Remarks
- Last Updated Date

### 2.9 Reporting & Analytics
- Purchase Summary Report (PO, Supplier, Total Amount, Status)
- Supplier Performance Report
- Pending / Overdue Orders
- GRN & Invoice Reconciliation
- Payment Status Report
- Purchase Trend / Cost Analysis

### 2.10 Integration with Other Modules
- Integration ID (auto-generated)
- PO / GRN / Invoice / Payment ID
- Destination Module (Inventory, Accounting, ERP, POS)
- Sync Status (Success / Failed / Pending)
- Sync Timestamp
- Error Log

