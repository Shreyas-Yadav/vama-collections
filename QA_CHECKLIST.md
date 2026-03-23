# Vama Inventory QA Checklist

This checklist covers the highest-probability real-world workflows and edge cases for the current application. It is intended for manual QA, UAT, and later API/integration test conversion.

## Test Environment

- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:8080`
- PostgreSQL database initialized with seed data
- Use a clean browser session for concurrency-sensitive or state-sensitive tests

## Global Checks For Every Scenario

- Verify the UI reflects the backend result after page reload
- Verify totals, balances, and stock values match backend-calculated values
- Verify failed actions do not partially save data
- Verify timestamps and statuses are updated consistently
- Verify error messages are actionable and do not expose stack traces

## 1. Create A New Product With Valid Data

**Preconditions**

- At least one active category exists
- At least one active vendor exists

**Steps**

1. Open `Inventory -> Add Product`
2. Enter a unique SKU, product name, category, vendor, prices, GST slab, and opening stock
3. Save the product

**Expected UI Result**

- Product appears in the inventory list
- Product detail page loads without error
- Stock badge reflects the opening stock state

**Backend/API Assertions**

- `POST /api/v1/products` succeeds
- Product row is created with the correct SKU and numeric values
- Stored stock matches the entered opening quantity

## 2. Reject Duplicate SKU

**Preconditions**

- A product already exists with a known SKU

**Steps**

1. Create another product using the same SKU
2. Submit the form

**Expected UI Result**

- Save fails
- Duplicate SKU message is shown
- No duplicate row appears in inventory

**Backend/API Assertions**

- `POST /api/v1/products` returns a validation or conflict error
- Only one product remains with that SKU

## 3. Deactivate Product Used In Historical Sales

**Preconditions**

- A product is already referenced in at least one bill

**Steps**

1. Open the product edit flow
2. Deactivate the product
3. Open create-bill flow and search for that product
4. Open an existing historical bill that used it

**Expected UI Result**

- Product is not available for new sale selection
- Historical bill still shows product details correctly

**Backend/API Assertions**

- Product remains in DB with `is_active = false`
- Historical bill items remain unchanged

## 4. Attempt To Delete Product With Stock On Hand

**Preconditions**

- Product stock is greater than `0`

**Steps**

1. Attempt to delete the product from inventory actions

**Expected UI Result**

- Delete is blocked or converted into deactivation behavior
- User sees a clear reason

**Backend/API Assertions**

- Product is not hard deleted
- Historical and inventory references remain intact

## 5. Verify Low-Stock Threshold Transitions

**Preconditions**

- Product low-stock threshold is `5`

**Steps**

1. Set stock to `10`
2. Verify status
3. Set stock to `5`
4. Verify status
5. Set stock to `1`
6. Verify status
7. Set stock to `0`
8. Verify status

**Expected UI Result**

- `10` shows `IN_STOCK`
- `5` and `1` show `LOW_STOCK`
- `0` shows `OUT_OF_STOCK`

**Backend/API Assertions**

- Product stock updates accurately after each adjustment
- Returned stock status matches the derived server rule

## 6. Manual Stock Adjustment Requires Reason

**Preconditions**

- Product exists and is editable

**Steps**

1. Perform stock increase with a reason
2. Perform stock decrease with a reason
3. Attempt an adjustment without a reason

**Expected UI Result**

- Valid adjustments succeed
- Missing-reason adjustment fails with validation feedback

**Backend/API Assertions**

- Each valid adjustment creates one stock movement
- Movement reason is persisted
- Invalid adjustment creates no movement

## 7. Create Purchase Order Without Affecting Stock

**Preconditions**

- Vendor exists
- Products exist

**Steps**

1. Create a purchase order for multiple products
2. Save or send the purchase order
3. Recheck inventory quantities

**Expected UI Result**

- PO appears in purchase order list
- Product stock remains unchanged

**Backend/API Assertions**

- `purchase_orders` and `purchase_order_items` are created
- No purchase receipt movement is posted yet

## 8. Record Partial PO Receipt

**Preconditions**

- A purchase order exists with pending quantity

**Steps**

1. Receive part of the ordered quantity for one or more lines
2. Save the receipt

**Expected UI Result**

- PO status becomes `PARTIALLY_RECEIVED`
- Received quantities update correctly
- Product stock increases only by received quantity

**Backend/API Assertions**

- Stock movement is created only for received units
- Product stock increments correctly
- Pending quantity remains for unreceived units

## 9. Complete Final PO Receipt

**Preconditions**

- A PO is already `PARTIALLY_RECEIVED`

**Steps**

1. Receive all remaining quantities
2. Save the receipt

**Expected UI Result**

- PO status becomes `RECEIVED`
- No pending quantity remains

**Backend/API Assertions**

- Total received equals total ordered
- No over-receipt occurs

## 10. Reject Receipt On Cancelled PO

**Preconditions**

- PO status is `CANCELLED`

**Steps**

1. Attempt to submit a receipt for the cancelled PO

**Expected UI Result**

- Receipt action fails with a clear error

**Backend/API Assertions**

- No stock movement is created
- Product stock remains unchanged

## 11. Create Bill For Walk-In Customer

**Preconditions**

- Product exists with enough stock

**Steps**

1. Create a bill without selecting a saved customer
2. Add one or more products
3. Submit the bill

**Expected UI Result**

- Bill is created successfully
- Bill appears in the sales list
- Inventory decreases accordingly

**Backend/API Assertions**

- Bill and bill items are created
- Sale stock movement is posted
- Walk-in customer handling remains valid

## 12. Create Bill With Partial Payment

**Preconditions**

- Registered customer exists
- Product stock exists

**Steps**

1. Create a bill for a saved customer
2. Record payment less than grand total
3. Save the bill or payment

**Expected UI Result**

- Bill status becomes `PARTIALLY_PAID`
- Balance due is shown correctly

**Backend/API Assertions**

- Bill stores correct `amount_paid` and `balance_due`
- Payment event exists if recorded as separate transaction

## 13. Reject Overpayment On Bill

**Preconditions**

- Bill exists with a remaining balance

**Steps**

1. Record payment greater than the balance due
2. Submit

**Expected UI Result**

- Payment fails with clear validation

**Backend/API Assertions**

- No invalid payment event is stored
- Balance due never becomes negative

## 14. Reject Sale With Insufficient Stock

**Preconditions**

- Product stock is lower than requested quantity

**Steps**

1. Create a bill with quantity higher than available stock
2. Submit the bill

**Expected UI Result**

- Bill creation fails
- No partial success state is shown

**Backend/API Assertions**

- No bill is created, or transaction is fully rolled back
- No stock movement is posted
- Product stock remains unchanged

## 15. Concurrent Sale On Low-Stock Product

**Preconditions**

- Product stock is `1`
- Two browser sessions are available

**Steps**

1. In session A, prepare a bill for quantity `1`
2. In session B, prepare a bill for quantity `1`
3. Submit both nearly at the same time

**Expected UI Result**

- One sale succeeds
- The other fails with insufficient stock

**Backend/API Assertions**

- Final product stock never becomes negative
- Only one sale stock deduction is persisted

## 16. Cancel Bill After Stock Issue

**Preconditions**

- Completed bill exists and has already reduced stock

**Steps**

1. Open the bill
2. Cancel the bill

**Expected UI Result**

- Bill status updates to cancelled
- Inventory is restored

**Backend/API Assertions**

- Reversal stock movement is created
- Original sale movement remains immutable
- Product stock returns correctly

## 17. Update Product Master After Historical Transactions

**Preconditions**

- Product exists in historical bills or purchase orders

**Steps**

1. Change product name, GST slab, or price
2. Open old bills and purchase orders using that product

**Expected UI Result**

- Product master shows latest values
- Historical documents retain original snapshot values

**Backend/API Assertions**

- Product row is updated
- Historical bill and PO item snapshots are unchanged

## 18. Customer Duplicate By Phone Or GSTIN

**Preconditions**

- Existing customer already has known phone or GSTIN

**Steps**

1. Create a new customer using the same phone or GSTIN
2. Save the customer

**Expected UI Result**

- Warning or rejection appears per current business rule

**Backend/API Assertions**

- Duplicate handling is consistent with policy
- Search results remain unambiguous

## 19. Search, Sort, And Pagination Stability

**Preconditions**

- Enough data exists to span multiple pages

**Steps**

1. Search inventory by exact SKU
2. Search by partial product name
3. Sort ascending and descending on supported columns
4. Switch pages
5. Combine filters with pagination

**Expected UI Result**

- Results remain stable and deterministic
- No duplicate rows appear across pages
- No incorrect empty state appears

**Backend/API Assertions**

- `sortBy` and `sortDir` are accepted correctly
- Unsupported sort fields fail cleanly
- Totals and page counts stay accurate

## 20. Update Store Settings And Verify Future Documents

**Preconditions**

- Store settings record exists

**Steps**

1. Open settings page
2. Change store name, phone, GSTIN, or bank details
3. Save settings
4. Create a new bill
5. Open an older bill if document snapshots are part of the design

**Expected UI Result**

- Settings save successfully
- New documents reflect updated settings
- Older documents remain behaviorally consistent

**Backend/API Assertions**

- `GET /api/v1/settings/store` returns updated values
- `PUT /api/v1/settings/store` persists the latest values

## Recommended Execution Order

1. Master data: categories, vendors, customers, products
2. Inventory behavior: thresholds, adjustments, delete/deactivate
3. Purchase flow: PO create, partial receipt, final receipt, cancelled receipt
4. Sales flow: bill create, payment, overpayment, insufficient stock, cancellation
5. Historical integrity: snapshot checks, store settings, deactivated products
6. Stability checks: concurrency, search, sorting, pagination

## Regression Focus Areas

- Stock ledger integrity after receipts, sales, and cancellations
- Snapshot integrity for bill items and PO items after master data changes
- Bill totals and payment status transitions
- Soft-delete or deactivate behavior for referenced records
- Frontend refresh behavior after failed and successful mutations
