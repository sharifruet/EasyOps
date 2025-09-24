## 🔹 3. Sales & Customer Management

### 3.1 Customer Master
- Customer ID (auto-generated unique ID)
- Customer Name / Company
- Customer Code
- Contact Person
- Email / Phone / Fax
- Address (Street, City, State, Country, Zip Code)
- Customer Type (Retail / Wholesale / VIP / Online)
- Credit Limit
- Payment Terms
- Tax Identification (GST / VAT Number)
- Status (Active / Inactive)
- Created By / Created Date
- Last Updated By / Date

### 3.2 Customer Accounts
- Account ID (auto-generated)
- Customer ID (linked)
- Account Balance
- Outstanding Amount
- Credit Limit Used
- Last Payment Date
- Status (Active / Blocked / Overdue)
- Notes / Remarks

### 3.3 Sales Orders (SO)
- SO ID (auto-generated)
- SO Number
- Customer ID
- Order Date / Expected Delivery Date
- Status (Draft / Confirmed / Partially Shipped / Completed / Cancelled)
- Ordered By / Approved By
- Total Amount / Currency / Tax
- Payment Terms
- Notes / Remarks

### 3.4 Sales Order Items
- SO Item ID
- SO ID (linked)
- Product ID / SKU
- Quantity Ordered / Unit of Measure
- Unit Price / Tax / Discount
- Expected Delivery Date
- Shipped Quantity
- Status (Pending / Shipped / Partially Shipped / Cancelled)
- Notes / Remarks

### 3.5 Shipment / Delivery Management
- Shipment ID (auto-generated)
- SO ID (linked)
- Shipment Number
- Warehouse / Dispatch Location
- Shipped Date / Expected Delivery Date
- Carrier / Courier Details
- Tracking Number
- Delivered By / Received By
- Status (Pending / In Transit / Delivered / Returned)
- Notes / Remarks

### 3.6 Customer Invoices
- Invoice ID (auto-generated)
- Invoice Number
- SO ID / Customer ID
- Invoice Date / Due Date
- Amount / Currency / Tax
- Payment Status (Pending / Paid / Partially Paid / Overdue)
- Notes / Remarks

### 3.7 Customer Payments
- Payment ID (auto-generated)
- Invoice ID / Customer ID
- Payment Date / Time
- Amount Paid / Currency
- Payment Method (Bank Transfer / Cash / Cheque / Online)
- Payment Reference / Transaction ID
- Approved By / Processed By
- Notes / Remarks

### 3.8 Customer Interaction & CRM
- Interaction ID (auto-generated)
- Customer ID
- Interaction Type (Call / Email / Meeting / Support Ticket)
- Interaction Date & Time
- Interaction Notes / Remarks
- Follow-up Date
- Responsible Staff
- Status (Pending / Completed / Escalated)

### 3.9 Customer Feedback & Complaints
- Feedback ID (auto-generated)
- Customer ID
- Feedback / Complaint Type
- Description / Details
- Submitted Date
- Status (Open / In Progress / Resolved / Closed)
- Assigned To / Handled By
- Resolution Notes / Date

### 3.10 Reporting & Analytics
- Sales Summary Report (SO, Customer, Total Amount, Status)
- Customer Outstanding / Aging Report
- Payment Collection Report
- Delivery & Shipment Report
- Customer Feedback & Complaint Report
- Sales Trend / Revenue Analysis

### 3.11 Integration with Other Modules
- Integration ID (auto-generated)
- SO / Invoice / Payment / Shipment ID
- Destination Module (Inventory, Accounting, ERP, POS, CRM)
- Sync Status (Success / Failed / Pending)
- Sync Timestamp
- Error Log

