CREATE TABLE store_settings (
    id UUID PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(120),
    address_line1 VARCHAR(255),
    city VARCHAR(120),
    state VARCHAR(120),
    pincode VARCHAR(20),
    gstin VARCHAR(20),
    bank_name VARCHAR(120),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    parent_id UUID NULL REFERENCES categories(id),
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    alternate_phone VARCHAR(30),
    email VARCHAR(120),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    gstin VARCHAR(20),
    pan_number VARCHAR(20),
    vendor_type VARCHAR(32) NOT NULL,
    credit_period_days INTEGER NOT NULL,
    notes VARCHAR(1000),
    is_active BOOLEAN NOT NULL,
    total_purchase_value BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    alternate_phone VARCHAR(30),
    email VARCHAR(120),
    address_line1 VARCHAR(255),
    city VARCHAR(120),
    state VARCHAR(120),
    pincode VARCHAR(20),
    gstin VARCHAR(20),
    total_purchase_value BIGINT NOT NULL,
    total_orders INTEGER NOT NULL,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    loyalty_points INTEGER NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    product_type VARCHAR(32) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    fabric_type VARCHAR(32) NOT NULL,
    color VARCHAR(80) NOT NULL,
    pattern VARCHAR(80) NOT NULL,
    design_code VARCHAR(80),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    cost_price BIGINT NOT NULL,
    selling_price BIGINT NOT NULL,
    mrp BIGINT,
    gst_slab VARCHAR(32) NOT NULL,
    hsn_code VARCHAR(20) NOT NULL,
    quantity_in_stock INTEGER NOT NULL,
    low_stock_threshold INTEGER NOT NULL,
    length NUMERIC(10,2),
    width NUMERIC(10,2),
    blouse_included BOOLEAN,
    blouse_length NUMERIC(10,2),
    weight NUMERIC(10,2),
    tags TEXT,
    is_active BOOLEAN NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    is_primary BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY,
    po_number VARCHAR(32) NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    vendor_name VARCHAR(150) NOT NULL,
    status VARCHAR(32) NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    received_date DATE,
    subtotal BIGINT NOT NULL,
    total_gst BIGINT NOT NULL,
    total_amount BIGINT NOT NULL,
    discount_amount BIGINT NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL,
    unit_cost BIGINT NOT NULL,
    total_cost BIGINT NOT NULL,
    gst_slab VARCHAR(32) NOT NULL,
    hsn_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE bills (
    id UUID PRIMARY KEY,
    bill_number VARCHAR(32) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30),
    customer_gstin VARCHAR(20),
    status VARCHAR(32) NOT NULL,
    is_inter_state BOOLEAN NOT NULL,
    is_gst_enabled BOOLEAN NOT NULL,
    subtotal BIGINT NOT NULL,
    total_discount BIGINT NOT NULL,
    total_cgst BIGINT NOT NULL,
    total_sgst BIGINT NOT NULL,
    total_igst BIGINT NOT NULL,
    total_gst BIGINT NOT NULL,
    round_off BIGINT NOT NULL,
    grand_total BIGINT NOT NULL,
    amount_paid BIGINT NOT NULL,
    balance_due BIGINT NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    payment_details VARCHAR(1000),
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE bill_items (
    id UUID PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price BIGINT NOT NULL,
    discount_percent INTEGER NOT NULL,
    discount_amount BIGINT NOT NULL,
    taxable_amount BIGINT NOT NULL,
    cgst BIGINT NOT NULL,
    sgst BIGINT NOT NULL,
    igst BIGINT NOT NULL,
    line_total BIGINT NOT NULL,
    hsn_code VARCHAR(20) NOT NULL,
    gst_slab VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE payment_events (
    id UUID PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    note VARCHAR(500),
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    movement_type VARCHAR(40) NOT NULL,
    source_type VARCHAR(40) NOT NULL,
    source_id UUID,
    quantity_delta INTEGER NOT NULL,
    unit_cost BIGINT,
    reason VARCHAR(255) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE document_sequences (
    sequence_key VARCHAR(40) PRIMARY KEY,
    current_value BIGINT NOT NULL
);

INSERT INTO document_sequences(sequence_key, current_value) VALUES
('PO', 0),
('BILL', 0);
