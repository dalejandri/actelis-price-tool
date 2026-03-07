/**
 * Actelis Price Tool — Browser PDF Generator
 * Uses jsPDF + jspdf-autotable. No backend required.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Brand palette ───────────────────────────────────────────────────────────
const NAVY    = [11,  29,  58];
const AMBER   = [217, 119, 6];
const GREEN   = [5,   150, 105];
const TEXT    = [26,  32,  53];
const MUTED   = [100, 116, 139];
const LIGHT   = [244, 246, 250];
const BORDER  = [226, 232, 240];
const WHITE   = [255, 255, 255];
const BLUE    = [29,  78,  216];
const BLUE_BG = [239, 246, 255];

const STATUS_COLORS = {
  New:          [59,  130, 246],
  "In Progress":[245, 158, 11],
  Ready:        [5,   150, 105],
  Approved:     [5,   150, 105],
  Submitted:    [139, 92,  246],
};

const TOTAL_PH = "{TOTAL_PAGES}";

const fmt = n =>
  n == null || n === 0
    ? "—"
    : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Per-page frame (header + footer) ────────────────────────────────────────
function drawFrame(doc, quoteNum) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pg = doc.internal.getCurrentPageInfo().pageNumber;

  // Header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 17, "F");

  // ACTELIS amber badge
  doc.setFillColor(...AMBER);
  doc.roundedRect(10, 3.5, 23, 8, 1.5, 1.5, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("ACTELIS", 21.5, 9.2, { align: "center" });

  // "Price Quotation" label
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Price Quotation", 36, 9);

  // Quote number (right)
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.text("Quote #", W - 10, 6, { align: "right" });
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(quoteNum || "DRAFT", W - 10, 11.5, { align: "right" });

  // Footer bar
  doc.setFillColor(241, 245, 249);
  doc.rect(0, H - 9, W, 9, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(0, H - 9, W, H - 9);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(
    "Actelis Networks, Inc.  |  This quotation is confidential and intended solely for the named recipient.",
    10, H - 3.5
  );
  doc.text(`Page ${pg} of ${TOTAL_PH}`, W - 10, H - 3.5, { align: "right" });
}

// ─── Main export function ─────────────────────────────────────────────────────
export function exportQuotePDF(quote) {
  const doc  = new jsPDF({ unit: "mm", format: "letter", compress: true });
  const W    = doc.internal.pageSize.getWidth();   // 215.9 mm
  const H    = doc.internal.pageSize.getHeight();  // 279.4 mm
  const ML   = 10;          // left margin
  const MR   = 10;          // right margin
  const CW   = W - ML - MR; // 195.9 mm usable
  const TOP  = 22;          // first content Y (below header)
  let y      = TOP;

  const qn = quote.quote_num || "DRAFT";

  // Draw first page header/footer
  drawFrame(doc, qn);

  // ── TITLE ────────────────────────────────────────────────────────────────
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Price Quotation", ML, y);

  doc.setTextColor(...AMBER);
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text(`#${qn}`, W - MR, y, { align: "right" });

  y += 5;

  // ── STATUS + DATES ───────────────────────────────────────────────────────
  const sc = STATUS_COLORS[quote.status] || NAVY;
  doc.setFillColor(...sc);
  doc.circle(ML + 1.5, y - 1.5, 1.5, "F");
  doc.setTextColor(...sc);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(quote.status || "New", ML + 4, y - 0.3);

  const afterStatus = ML + 4 + doc.getTextWidth(quote.status || "New") + 1.5;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `Issued ${quote.date || "—"}  ·  Expires ${quote.expiry || "—"}`,
    afterStatus, y - 0.3
  );

  y += 7;

  // ── SECTION HELPER ────────────────────────────────────────────────────────
  function section(title) {
    y += 2;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.line(ML, y, W - MR, y);
    y += 4;
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(title.toUpperCase(), ML, y);
    y += 5;
  }

  // ── CUSTOMER DETAILS ─────────────────────────────────────────────────────
  section("Customer & Quote Details");

  const fields = [
    ["Customer",          quote.customer     || ""],
    ["Contact",           quote.contact      || ""],
    ["Quoted By",         quote.quoted_by    || ""],
    ["Customer Type",     quote.customer_type|| ""],
    ["Region",            quote.region       || ""],
    ["Deal Registration", quote.deal_reg ? "Active ✓" : "Not registered"],
    ["Payment Terms",     quote.payment      || ""],
    ["Shipping Terms",    quote.shipping     || ""],
    ["Quote Date",        quote.date         || ""],
  ];

  const COLS = 3;
  const colW = CW / COLS;
  for (let i = 0; i < fields.length; i += COLS) {
    const row = fields.slice(i, i + COLS);
    // Labels
    row.forEach(([label], ci) => {
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(label, ML + ci * colW, y);
    });
    y += 3.5;
    // Values
    row.forEach(([, val], ci) => {
      doc.setTextColor(...TEXT);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(String(val), ML + ci * colW, y);
    });
    y += 6;
  }

  // ── COMMENTS ─────────────────────────────────────────────────────────────
  if (quote.comments) {
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("Comments", ML, y);
    y += 3.5;
    const cmtLines = doc.splitTextToSize(quote.comments, CW - 8);
    const cmtH = cmtLines.length * 4 + 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(ML, y - 1.5, CW, cmtH, 1.5, 1.5, "F");
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(cmtLines, ML + 3, y + 2);
    y += cmtH + 3;
  }

  // ── LINE ITEMS TABLE ──────────────────────────────────────────────────────
  section("Line Items");

  const tableHead = [["PART #","DESCRIPTION","QTY","LIST PRICE","DISC","CUSTOMER $"]];
  const tableBody = [];
  let currentSite = null;
  let hwTotal    = 0;
  let listTotal  = 0;

  for (const line of (quote.lines || [])) {
    const site = line.site || "";
    if (site && site !== currentSite) {
      currentSite = site;
      tableBody.push([{
        content: `  ${site}`,
        colSpan: 6,
        styles: { fontStyle:"bold", textColor:BLUE, fillColor:BLUE_BG, fontSize:7.5 },
      }]);
    }

    const lp   = parseFloat(line.list_price || 0);
    const disc = parseFloat(line.discount   || 0);
    const qty  = parseInt(line.qty          || 1);
    let listStr, discStr, custStr;

    if (line.is_svc || lp === 0) {
      listStr = "—";
      discStr = "—";
      custStr = line.svc_string || "—";
    } else {
      const ext  = lp * (1 - disc) * qty;
      hwTotal   += ext;
      listTotal += lp * qty;
      listStr = `$${lp.toLocaleString("en-US",{minimumFractionDigits:2})}`;
      discStr = `${(disc*100).toFixed(0)}%`;
      custStr = `$${ext.toLocaleString("en-US",{minimumFractionDigits:2})}`;
    }

    tableBody.push([
      { content: line.pn || "",
        styles: { font:"courier", fontStyle:"bold", fontSize:7.5, textColor:NAVY } },
      { content: `${line.desc || ""}\n${line.cat || ""}`,
        styles: { fontSize:8, cellPadding:{top:3,bottom:3,left:3,right:3} } },
      { content: String(qty),  styles: { halign:"center" } },
      { content: listStr,      styles: { halign:"right", textColor:MUTED } },
      { content: discStr,      styles: { halign:"center", textColor:GREEN } },
      { content: custStr,      styles: { halign:"right", fontStyle:"bold", textColor:NAVY } },
    ]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: tableHead,
    body: tableBody,
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontSize:  6.5,
      fontStyle: "bold",
      cellPadding: { top:3.5, bottom:3.5, left:3, right:3 },
    },
    bodyStyles: {
      fontSize:    8,
      textColor:   TEXT,
      cellPadding: { top:3, bottom:3, left:3, right:3 },
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 27 },
      1: { cellWidth: 70 },
      2: { cellWidth: 13, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 27, halign: "right" },
    },
    tableLineColor:  BORDER,
    tableLineWidth:  0.2,
    repeatRows: 1,
    didDrawPage: () => drawFrame(doc, qn),
  });

  y = doc.lastAutoTable.finalY + 7;

  // ── TOTALS ────────────────────────────────────────────────────────────────
  const shipAmt = quote.add_ship ? hwTotal * 0.02 : 0;
  const ccAmt   = quote.add_cc   ? hwTotal * 0.03 : 0;
  const taxRate = parseFloat(quote.tax_rate || 0);
  const taxAmt  = quote.add_tax  ? hwTotal * (taxRate / 100) : 0;
  const grand   = hwTotal + shipAmt + ccAmt + taxAmt;
  const savings = listTotal - hwTotal;

  const totRows = [
    ["List Price Total:",            fmt(listTotal),  MUTED, TEXT,  false],
    savings > 0
      ? ["Discount Savings:",        `- ${fmt(savings)}`, MUTED, GREEN, false]
      : null,
    ["Hardware Subtotal:",           fmt(hwTotal),    MUTED, TEXT,  false],
    shipAmt ? ["Shipping (~2%):",    fmt(shipAmt),    MUTED, TEXT,  false] : null,
    ccAmt   ? ["Credit Card (3%):",  fmt(ccAmt),      MUTED, TEXT,  false] : null,
    taxAmt  ? [`Sales Tax (${taxRate.toFixed(0)}%):`, fmt(taxAmt), MUTED, TEXT, false] : null,
  ].filter(Boolean);

  const TX = W - MR;  // right edge
  const TW = 55;      // label starts this many mm from right

  totRows.forEach(([label, value, lc, vc]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...lc);
    doc.text(label, TX - TW, y, { align: "right" });
    doc.setTextColor(...vc);
    doc.text(value, TX, y, { align: "right" });
    y += 5;
  });

  // Amber divider line
  y += 1;
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.7);
  doc.line(TX - TW - 4, y, TX, y);
  y += 5;

  // Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("GRAND TOTAL:", TX - TW, y, { align: "right" });
  doc.setFontSize(13);
  doc.setTextColor(...AMBER);
  doc.text(fmt(grand), TX, y, { align: "right" });
  y += 10;

  // ── TERMS ─────────────────────────────────────────────────────────────────
  if (y < H - 38) {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.line(ML, y, W - MR, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text("Terms & Conditions", ML, y);
    y += 4;
    const terms =
      "All prices are in US Dollars and subject to change without notice. " +
      "This quotation is valid until the expiry date shown above. " +
      "Products are subject to availability. Payment is due per the terms indicated. " +
      "Acceptance of this quotation is subject to Actelis Networks' standard Terms and Conditions of Sale.";
    const termLines = doc.splitTextToSize(terms, CW);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(termLines, ML, y);
  }

  // Replace page count placeholder and save
  doc.putTotalPages(TOTAL_PH);
  const safeName = qn.replace(/\//g, "_").replace(/\s+/g, "_");
  doc.save(`Actelis_Quote_${safeName}.pdf`);
}
