const express = require("express");
const router = new express.Router();
const db = require("../db");  // Import the db client for database access

/** GET /invoices: Return a list of invoices */
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /invoices/[id]: Return a single invoice with details */
router.get("/:id", async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code 
       FROM invoices WHERE id = $1`,
      [invoiceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = result.rows[0];

    // Fetch company details
    const companyResult = await db.query(
      "SELECT code, name, description FROM companies WHERE code = $1",
      [invoice.comp_code]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = companyResult.rows[0];

    // Add company info to the invoice
    return res.json({
      invoice: {
        id: invoice.id,
        amt: invoice.amt,
        paid: invoice.paid,
        add_date: invoice.add_date,
        paid_date: invoice.paid_date,
        company: company,
      },
    });
  } catch (err) {
    return next(err);
  }
});

/** POST /invoices: Add a new invoice */
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2) 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** PUT /invoices/[id]: Update an existing invoice */
router.put("/:id", async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices SET amt = $1 WHERE id = $2 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /invoices/[id]: Delete an invoice */
router.delete("/:id", async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices WHERE id = $1 RETURNING id`,
      [invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
