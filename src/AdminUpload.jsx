import { useState, useCallback, useRef } from "react";

const N = "#0B1D3A", A = "#D97706", B = "#E2E8F0", T = "#1A2035", M = "#64748B";


// ── XLSX parser — handles the Actelis Price_List_Letter.xlsx format ───────────
function processXLSX(rows, type) {
  if (type !== "pricelist") throw new Error("XLSX import is supported for Price List only. Use CSV for discounts.");

  const items = [];
  let currentCat = "";

  for (const row of rows) {
    const catCol   = String(row[2] || "").trim();
    const pnCol    = String(row[3] || "").trim();
    const descCol  = String(row[4] || "").trim();
    const priceCol = row[6];

    // Category header row (has category but no part number)
    if (catCol && catCol !== "Category" && !pnCol) {
      currentCat = catCol;
      continue;
    }

    // Product row
    if (pnCol && descCol && priceCol !== "" && priceCol !== null) {
      const price = parsePrice(String(priceCol));
      if (price > 0) {
        items.push({ pn: pnCol, desc: descCol, price, cat: currentCat });
      }
    }
  }

  if (items.length === 0) throw new Error("No products found — check the file format. Expected: Category in col C, Part# in col D, Description in col E, Price in col G.");
  return items;
}

// ── CSV column mappings (matches Actelis TablesPrice_List.csv format) ─────────
const COL = {
  pn:          ["Part Number", "PN", "Part#", "PartNumber"],
  desc:        ["Description", "Desc"],
  price:       ["List Price", "ListPrice", "Price", "List"],
  cat:         ["Category", "Cat"],
  show:        ["ShowPriceList", "Show", "Active"],
  legacy:      ["Legacy", "IsLegacy"],
};

function findCol(headers, aliases) {
  for (const a of aliases) {
    const idx = headers.findIndex(h => h.trim().toLowerCase() === a.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

function parsePrice(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[$,\s]/g, "")) || 0;
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const result = [];
  let inQuote = false, row = [], cell = "";

  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i+1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        row.push(cell); cell = "";
      } else {
        cell += ch;
      }
    }
    if (!inQuote) {
      row.push(cell); cell = "";
      result.push(row); row = [];
    } else {
      cell += "\n";
    }
  }
  return result;
}

function processCSV(text, type) {
  const rows = parseCSV(text).filter(r => r.some(c => c.trim()));
  if (rows.length < 2) throw new Error("CSV appears empty");

  const headers = rows[0].map(h => h.trim());

  if (type === "pricelist") {
    const iPn    = findCol(headers, COL.pn);
    const iDesc  = findCol(headers, COL.desc);
    const iPrice = findCol(headers, COL.price);
    const iCat   = findCol(headers, COL.cat);
    const iShow  = findCol(headers, COL.show);
    const iLeg   = findCol(headers, COL.legacy);

    if (iPn < 0 || iDesc < 0)
      throw new Error(`Could not find required columns. Found: ${headers.join(", ")}`);

    const items = [];
    for (const row of rows.slice(1)) {
      if (!row[iPn]?.trim()) continue;
      const show   = iShow >= 0 ? String(row[iShow]).trim() : "1";
      const legacy = iLeg  >= 0 ? String(row[iLeg]).trim()  : "0";
      if (show !== "1" && show !== "true") continue;
      if (legacy === "1" || legacy === "true") continue;

      items.push({
        pn:    row[iPn].trim(),
        desc:  row[iDesc]?.trim() || "",
        price: parsePrice(row[iPrice]),
        cat:   row[iCat]?.trim() || "Uncategorized",
      });
    }
    return items;
  }

  if (type === "discounts") {
    // Expected: Category, naReseller, naEndUser, regBonus, emeaReseller, emeaEndUser
    const iCat  = findCol(headers, ["Category", "Cat"]);
    const iNaR  = findCol(headers, ["naReseller", "NA Reseller", "NA_Reseller"]);
    const iNaE  = findCol(headers, ["naEndUser",  "NA End User", "NA_EndUser"]);
    const iReg  = findCol(headers, ["regBonus",   "Reg Bonus",   "DealRegBonus"]);
    const iEmR  = findCol(headers, ["emeaReseller","EMEA Reseller"]);
    const iEmE  = findCol(headers, ["emeaEndUser", "EMEA End User"]);

    if (iCat < 0) throw new Error(`Could not find Category column. Found: ${headers.join(", ")}`);

    return rows.slice(1)
      .filter(r => r[iCat]?.trim())
      .map(row => ({
        cat:          row[iCat].trim(),
        naReseller:   parseFloat(row[iNaR]) || 0,
        naEndUser:    parseFloat(row[iNaE]) || 0,
        regBonus:     parseFloat(row[iReg]) || 0,
        emeaReseller: parseFloat(row[iEmR]) || 0,
        emeaEndUser:  parseFloat(row[iEmE]) || 0,
      }));
  }

  throw new Error("Unknown type");
}

// ── Diff helper ───────────────────────────────────────────────────────────────
function diffPriceLists(oldList, newList) {
  const oldMap = Object.fromEntries(oldList.map(p => [p.pn, p]));
  const newMap = Object.fromEntries(newList.map(p => [p.pn, p]));

  const added    = newList.filter(p => !oldMap[p.pn]);
  const removed  = oldList.filter(p => !newMap[p.pn]);
  const changed  = newList.filter(p => oldMap[p.pn] && oldMap[p.pn].price !== p.price);
  const unchanged = newList.filter(p => oldMap[p.pn] && oldMap[p.pn].price === p.price);

  return { added, removed, changed, unchanged };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminUpload({ onClose, currentPrices, currentDiscounts, currentServices }) {

  // Load SheetJS for xlsx parsing
  useEffect(() => {
    if (!window._XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = () => { window._XLSX = window.XLSX; };
      document.head.appendChild(s);
    }
  }, []);

  const [tab, setTab]         = useState("pricelist");
  const [drag, setDrag]       = useState(false);
  const [parsed, setParsed]   = useState(null);
  const [error, setError]     = useState(null);
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const inp = { width:"100%", padding:"8px 10px", border:`1px solid ${B}`,
    borderRadius:5, fontSize:13, color:T, background:"white", outline:"none",
    boxSizing:"border-box", fontFamily:"inherit" };

  const handleFile = useCallback((file) => {
    if (!file) return;
    setError(null); setParsed(null); setPreview(null);
    setFilename(file.name);
    const isXlsx = file.name.match(/\.xlsx?$/i);

    if (isXlsx) {
      // Use SheetJS to parse xlsx
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const XLSX = window._XLSX;
          if (!XLSX) throw new Error("XLSX library not loaded yet — try again in a moment");
          const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          const result = processXLSX(rows, tab);
          setParsed(result);
          if (tab === "pricelist") setPreview(diffPriceLists(currentPrices, result));
        } catch (err) { setError(err.message); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = processCSV(e.target.result, tab);
          setParsed(result);
          if (tab === "pricelist") setPreview(diffPriceLists(currentPrices, result));
        } catch (err) { setError(err.message); }
      };
      reader.readAsText(file);
    }
  }, [tab, currentPrices]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const downloadJSON = () => {
    const existing = {
      version:   new Date().toISOString().split("T")[0],
      updated:   new Date().toISOString().split("T")[0],
      priceList: tab === "pricelist" ? parsed : currentPrices,
      discounts: tab === "discounts" ? parsed : currentDiscounts,
      services:  currentServices,
    };
    const blob = new Blob([JSON.stringify(existing, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = "prices.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setParsed(null); setPreview(null); setError(null); setFilename(""); }}
      style={{ padding:"6px 16px", borderRadius:5, border:"none", cursor:"pointer", fontSize:13, fontWeight:700,
        background: tab===id ? N : "transparent", color: tab===id ? "white" : M }}>
      {label}
    </button>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(11,29,58,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(3px)" }}>
      <div style={{ background:"white", borderRadius:14, width:"min(820px,94vw)", maxHeight:"88vh",
        overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

        {/* Header */}
        <div style={{ background:N, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ color:A, fontWeight:800, fontSize:13, letterSpacing:"0.06em" }}>⚙ ADMIN — PRICE LIST MANAGER</div>
            <div style={{ color:"#64748B", fontSize:11, marginTop:2 }}>
              Upload a CSV → preview changes → download <code style={{color:"#94A3B8"}}>prices.json</code> → commit to GitHub
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748B", fontSize:22, cursor:"pointer" }}>×</button>
        </div>

        {/* Workflow steps banner */}
        <div style={{ background:"#F8FAFC", borderBottom:`1px solid ${B}`, padding:"10px 20px", display:"flex", gap:0 }}>
          {[["1","Upload CSV","📤"],["2","Preview Changes","🔍"],["3","Download JSON","⬇"],["4","git push","🚀"]].map(([n,l,ic],i) => (
            <div key={n} style={{ display:"flex", alignItems:"center", gap:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px",
                background: (i===0&&filename)||(i===1&&preview)||(i===2&&parsed) ? "#FFFBEB" : "transparent",
                borderRadius:6 }}>
                <span style={{ fontSize:14 }}>{ic}</span>
                <div>
                  <div style={{ fontSize:9, fontWeight:700, color:M, textTransform:"uppercase" }}>Step {n}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:T }}>{l}</div>
                </div>
              </div>
              {i < 3 && <span style={{ color:B, fontSize:18, margin:"0 2px" }}>›</span>}
            </div>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:20 }}>

          {/* Tab selector */}
          <div style={{ display:"flex", gap:4, marginBottom:16, background:"#F1F5F9", padding:4, borderRadius:7, width:"fit-content" }}>
            <TabBtn id="pricelist" label="Hardware Price List" />
            <TabBtn id="discounts" label="Discount Table" />
          </div>

          {/* Help text */}
          <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:7, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#1E40AF" }}>
            {tab === "pricelist" ? (<>
              <b>Recommended:</b> Upload <code>Price_List_Letter.xlsx</code> directly — it's auto-detected and parsed.<br/>Also accepts <code>TablesPrice_List.csv</code> from Access export.
            </>) : (<>
              <b>Expected columns:</b> Category, naReseller, naEndUser, regBonus, emeaReseller, emeaEndUser
              <br/>Values should be decimals (e.g. 0.33 = 33%). Export from <code>TablesDiscounts.csv</code>.
            </>)}
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onClick={() => fileRef.current.click()}
            style={{ border:`2px dashed ${drag ? A : B}`, borderRadius:10, padding:"28px 20px",
              textAlign:"center", cursor:"pointer", background:drag?"#FFFBEB":"#F8FAFC",
              transition:"all 0.15s", marginBottom:16 }}>
            <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }}
              onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize:28, marginBottom:8 }}>📂</div>
            <div style={{ fontSize:14, fontWeight:600, color:T }}>
              {filename ? `✓ ${filename}` : "Drop CSV file here or click to browse"}
            </div>
            <div style={{ fontSize:12, color:M, marginTop:4 }}>Accepts .xlsx (Price_List_Letter.xlsx) or .csv files</div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:7, padding:"10px 14px",
              marginBottom:16, fontSize:12, color:"#991B1B" }}>
              ⚠ {error}
            </div>
          )}

          {/* Preview — price list diff */}
          {preview && tab === "pricelist" && (
            <div style={{ marginBottom:16 }}>
              {/* Summary badges */}
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                {[
                  [preview.added.length,   "New items",     "#DCFCE7","#166534"],
                  [preview.removed.length, "Removed",       "#FEE2E2","#991B1B"],
                  [preview.changed.length, "Price changes", "#FEF3C7","#92400E"],
                  [preview.unchanged.length,"Unchanged",    "#F1F5F9","#475569"],
                ].map(([count, label, bg, color]) => (
                  <div key={label} style={{ background:bg, color, borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:700 }}>
                    {count} {label}
                  </div>
                ))}
              </div>

              {/* Changed prices table */}
              {preview.changed.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T, marginBottom:6 }}>🔄 Price Changes</div>
                  <div style={{ border:`1px solid ${B}`, borderRadius:7, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 110px 90px",
                      padding:"6px 10px", background:"#F1F5F9", fontSize:10, fontWeight:700, color:M,
                      textTransform:"uppercase", letterSpacing:"0.05em" }}>
                      <span>Part #</span><span>Description</span>
                      <span style={{textAlign:"right"}}>Old Price</span>
                      <span style={{textAlign:"right"}}>New Price</span>
                      <span style={{textAlign:"right"}}>Change</span>
                    </div>
                    {preview.changed.slice(0,50).map(p => {
                      const old = currentPrices.find(x => x.pn === p.pn);
                      const diff = p.price - (old?.price||0);
                      const pct  = old?.price ? ((diff/old.price)*100).toFixed(1) : "—";
                      return (
                        <div key={p.pn} style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 110px 90px",
                          padding:"7px 10px", borderTop:`1px solid #F1F5F9`, alignItems:"center", fontSize:12 }}>
                          <code style={{ fontSize:10, color:N, fontWeight:700 }}>{p.pn}</code>
                          <span style={{ color:T }}>{p.desc}</span>
                          <span style={{ textAlign:"right", color:M }}>${(old?.price||0).toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                          <span style={{ textAlign:"right", fontWeight:700, color:N }}>${p.price.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                          <span style={{ textAlign:"right", color:diff>0?"#DC2626":"#16A34A", fontWeight:700 }}>
                            {diff>0?"+":""}{pct}%
                          </span>
                        </div>
                      );
                    })}
                    {preview.changed.length > 50 && (
                      <div style={{ padding:"6px 10px", fontSize:11, color:M, textAlign:"center", borderTop:`1px solid #F1F5F9` }}>
                        +{preview.changed.length-50} more changes...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* New items */}
              {preview.added.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T, marginBottom:6 }}>✨ New Items ({preview.added.length})</div>
                  <div style={{ border:`1px solid #BBF7D0`, borderRadius:7, overflow:"hidden" }}>
                    {preview.added.slice(0,20).map(p => (
                      <div key={p.pn} style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px",
                        padding:"6px 10px", borderTop:"1px solid #F0FDF4", alignItems:"center", fontSize:12 }}>
                        <code style={{ fontSize:10, color:N, fontWeight:700 }}>{p.pn}</code>
                        <span style={{ color:T }}>{p.desc}</span>
                        <span style={{ textAlign:"right", color:"#166534", fontWeight:700 }}>${p.price.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                      </div>
                    ))}
                    {preview.added.length > 20 && (
                      <div style={{ padding:"6px 10px", fontSize:11, color:M, textAlign:"center" }}>+{preview.added.length-20} more...</div>
                    )}
                  </div>
                </div>
              )}

              {/* Removed items */}
              {preview.removed.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#991B1B", marginBottom:6 }}>🗑 Items Being Removed ({preview.removed.length})</div>
                  <div style={{ border:`1px solid #FCA5A5`, borderRadius:7, overflow:"hidden" }}>
                    {preview.removed.slice(0,10).map(p => (
                      <div key={p.pn} style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px",
                        padding:"6px 10px", borderTop:"1px solid #FEF2F2", alignItems:"center", fontSize:12 }}>
                        <code style={{ fontSize:10, color:"#991B1B", fontWeight:700 }}>{p.pn}</code>
                        <span style={{ color:"#64748B", textDecoration:"line-through" }}>{p.desc}</span>
                        <span style={{ textAlign:"right", color:"#64748B" }}>${p.price.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                      </div>
                    ))}
                    {preview.removed.length > 10 && (
                      <div style={{ padding:"6px 10px", fontSize:11, color:M, textAlign:"center" }}>+{preview.removed.length-10} more...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview — discounts */}
          {parsed && tab === "discounts" && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T, marginBottom:8 }}>✓ Parsed {parsed.length} discount categories</div>
              <div style={{ border:`1px solid ${B}`, borderRadius:7, overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 100px 100px",
                  padding:"6px 10px", background:"#F1F5F9", fontSize:10, fontWeight:700, color:M,
                  textTransform:"uppercase", letterSpacing:"0.04em" }}>
                  <span>Category</span><span style={{textAlign:"right"}}>NA Resl</span><span style={{textAlign:"right"}}>NA End</span>
                  <span style={{textAlign:"right"}}>Reg+</span><span style={{textAlign:"right"}}>EMEA Resl</span><span style={{textAlign:"right"}}>EMEA End</span>
                </div>
                {parsed.slice(0,20).map(d => (
                  <div key={d.cat} style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 100px 100px",
                    padding:"7px 10px", borderTop:`1px solid #F1F5F9`, fontSize:12, alignItems:"center" }}>
                    <span style={{ color:T, fontSize:11 }}>{d.cat}</span>
                    {[d.naReseller, d.naEndUser, d.regBonus, d.emeaReseller, d.emeaEndUser].map((v,i) => (
                      <span key={i} style={{ textAlign:"right", color:"#059669", fontWeight:600 }}>{(v*100).toFixed(0)}%</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions after download */}
          {parsed && (
            <div style={{ background:"#F0FDF4", border:"1px solid #86EFAC", borderRadius:8, padding:"12px 16px", fontSize:12, color:"#166534" }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>📋 After downloading prices.json:</div>
              <div style={{ fontFamily:"monospace", background:"#DCFCE7", borderRadius:5, padding:"8px 10px", fontSize:11, lineHeight:1.8 }}>
                1. Copy <b>prices.json</b> into your project's <b>public/</b> folder<br/>
                2. git add public/prices.json<br/>
                3. git commit -m "Update price list"<br/>
                4. git push<br/>
                <span style={{ color:"#4ADE80" }}>→ GitHub Actions deploys automatically in ~60 seconds</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${B}`, display:"flex",
          justifyContent:"space-between", alignItems:"center", background:"white" }}>
          <button onClick={onClose} style={{ padding:"8px 18px", borderRadius:6, border:`1px solid ${B}`,
            background:"white", fontSize:13, cursor:"pointer", color:M }}>
            Cancel
          </button>
          <button onClick={downloadJSON} disabled={!parsed}
            style={{ padding:"8px 24px", borderRadius:6, border:"none", fontSize:13, fontWeight:700,
              cursor: parsed ? "pointer" : "default",
              background: parsed ? A : "#E2E8F0",
              color: parsed ? "white" : "#94A3B8" }}>
            ⬇ Download prices.json
          </button>
        </div>
      </div>
    </div>
  );
}
