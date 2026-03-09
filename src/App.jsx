import { useState, useEffect, useMemo, useCallback } from "react";
import { exportQuotePDF } from "./pdfExport.js";
import AdminUpload from "./AdminUpload.jsx";


// ═══════════════ NODE CONFIGURATOR WIZARD ═══════════════

// ─── WIZARD PRICE DATA (embedded, separate from main quote price list) ────────
const PRICE_LIST = [{"pn":"501RG0016","desc":"ML622","price":1145.0,"cat":"A2. ML600 Family"},{"pn":"501RG0046","desc":"ML624","price":1720.0,"cat":"A2. ML600 Family"},{"pn":"501RG0067","desc":"ML638","price":2306.0,"cat":"A2. ML600 Family"},{"pn":"501RG0076","desc":"ML654S","price":3748.0,"cat":"A2. ML600 Family"},{"pn":"501RG0077","desc":"ML658S","price":4430.0,"cat":"A2. ML600 Family"},{"pn":"501RG0078","desc":"ML650SV","price":3308.0,"cat":"A2. ML600 Family"},{"pn":"501RG0106","desc":"ML684M","price":1950.0,"cat":"A2. ML600 Family"},{"pn":"501RG0111","desc":"ML6916EN","price":6554.0,"cat":"A2. ML600 Family"},{"pn":"501RG0115","desc":"ML6916EL","price":6665.0,"cat":"A2. ML600 Family"},{"pn":"501RG0116","desc":"ML644EL","price":3560.0,"cat":"A2. ML600 Family"},{"pn":"501RG0121","desc":"ML622i with 24/48Vdc","price":800.0,"cat":"A2. ML600 Family"},{"pn":"501RG0122","desc":"ML624i with 24/48Vdc","price":1260.0,"cat":"A2. ML600 Family"},{"pn":"501RG0217","desc":"ML648E","price":3031.0,"cat":"A2. ML600 Family"},{"pn":"501RG0218","desc":"ML6416E","price":4595.0,"cat":"A2. ML600 Family"},{"pn":"501RG0238","desc":"ML6916E (w/o SyncE)","price":6090.0,"cat":"A2. ML600 Family"},{"pn":"501RG0253","desc":"ML698ES","price":5055.0,"cat":"A2. ML600 Family"},{"pn":"501RG0254","desc":"ML6916ES","price":6550.0,"cat":"A2. ML600 Family"},{"pn":"501RG0259","desc":"ML698E","price":3679.0,"cat":"A2. ML600 Family"},{"pn":"501RG3230","desc":"ML684D (New)","price":1950.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3231","desc":"ML680DF (New)","price":953.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3240","desc":"ML622D (New)","price":1374.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG0232","desc":"ML684DTP","price":2295.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3255","desc":"ML684D-M (12/24V)","price":1995.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3256","desc":"ML684D-M (48/60V)","price":1995.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3355","desc":"ML684DL-M (12/24V)","price":2795.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3356","desc":"ML684DL-M (48/60V)","price":2795.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3358","desc":"ML684DLP-M","price":2989.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3376","desc":"ML680DL-M (48/60V)","price":2019.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3378","desc":"ML680DLP-M","price":1410.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG0134","desc":"GL850L-16O","price":4251.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0135","desc":"GL850L-16R","price":3917.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0139","desc":"GL830-16O","price":3748.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0140","desc":"GL830-8O","price":3148.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0143","desc":"GL830-16R","price":3330.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0144","desc":"GL830-8R","price":2921.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0167","desc":"GL904","price":1120.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0168","desc":"GL904-R","price":1410.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0302","desc":"GL916","price":1950.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0300","desc":"GL916-R","price":2230.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0303","desc":"GL908","price":1380.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0301","desc":"GL908-R","price":1680.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"506R61334","desc":"GL9110C","price":1800.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R61342","desc":"GL9104C","price":1550.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R61335","desc":"GL901CS","price":162.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R61337","desc":"GL93C","price":110.0,"cat":"A1.3 GL9000 CPEs"},{"pn":"506R61336","desc":"GL93C-W","price":257.0,"cat":"A1.3 GL9000 CPEs"},{"pn":"501S61245E","desc":"GL91 (EU/US)","price":150.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61245U","desc":"GL91 (UK)","price":150.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61246","desc":"GL91T","price":120.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61246E","desc":"GL91T (EU/US)","price":155.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61247","desc":"GL91T-RB","price":195.0,"cat":"A1.5 GL900 CPEs"},{"pn":"506R61245","desc":"GL91","price":110.0,"cat":"A1.5 GL900 CPEs"},{"pn":"502R20230","desc":"Chassis 200 Shelf (CHS-200)","price":1127.0,"cat":"A4.1 Shelves"},{"pn":"502R02110","desc":"Chassis 2000B Shelf, 19\" (CHS-2000B)","price":2985.0,"cat":"A4.1 Shelves"},{"pn":"503R60042","desc":"Service Dispatcher Unit (SDU-450)","price":10345.0,"cat":"A4.2 SDU (Service Dispatch Units)"},{"pn":"503R60043","desc":"Service Dispatcher Unit (SDU-450G)","price":11495.0,"cat":"A4.2 SDU (Service Dispatch Units)"},{"pn":"503R20132","desc":"MLU-32DF (32 pairs, front access)","price":6325.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20164","desc":"MLU-64DF (64 pairs, front access)","price":9195.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20232","desc":"MLU-32DR (32 pairs, rear access)","price":6325.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20264","desc":"MLU-64DR (64 pairs, rear access)","price":9195.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"504R20110","desc":"DSL Quad Cable, 4xRJ-45, 10ft/3m","price":46.0,"cat":"C4.1 DSL Cables"},{"pn":"504R20120","desc":"DSL Octal Cable, 8xRJ-45, 10ft/3m","price":69.0,"cat":"C4.1 DSL Cables"},{"pn":"510K20230","desc":"Accessories Kit for CHS-200","price":115.0,"cat":"A4.4 CHS-200 Related Items"},{"pn":"506R30070","desc":"Fan Control Module for CHS-2000B","price":685.0,"cat":"A4.5 CHS-2000 Related Items"},{"pn":"550A00046","desc":"Flash Card for SDU-450/G","price":173.0,"cat":"A4.5 CHS-2000 Related Items"},{"pn":"506R00006","desc":"AC-DC PSU for ML600/ML740/ML530 (NA)","price":110.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00006E","desc":"AC-DC PSU for ML600/ML740/ML530 (EU)","price":110.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00008","desc":"AC-DC PSU for GL900 (NA)","price":58.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00008U","desc":"AC-DC PSU for GL900 (UK)","price":58.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00013","desc":"AC/DC PSU for GL800 (NA)","price":138.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00013E","desc":"AC/DC PSU for GL800 (EU)","price":138.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61181","desc":"DIN Rail PSU 24VDC for ML600Dx (no PoE)","price":156.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61184","desc":"DIN Rail PSU 24VDC + EU Cables","price":184.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61185","desc":"DIN Rail PSU 24VDC + US Cables","price":184.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61191","desc":"DIN Rail PSU 48VDC with PoE","price":225.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"510K00060","desc":"Accessories Kit for ML600/ML700/ML530","price":23.0,"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items"},{"pn":"510R21080","desc":"Wall Mount Kit for ML600/ML700/GL800/GL900","price":52.0,"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items"},{"pn":"510R21070","desc":"Rack Mount Sleeve Kit (2 ML600/700/530)","price":225.0,"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items"},{"pn":"506R00002","desc":"1000Base-LX SMF SFP (10km)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00012","desc":"1000Base-SX MMF SFP (500m)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00022","desc":"100Base-FX MMF SFP (2km)","price":115.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00032","desc":"100Base-FX SMF SFP (15km)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00042","desc":"1000Base-T SFP","price":103.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61154","desc":"2500Base-FX SMF SFP (30km)","price":289.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61155","desc":"2500Base-FX MMF SFP (500m)","price":127.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61213","desc":"100/1000Base-T SFP","price":103.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61235","desc":"10G BASE-LR SFP+ (10km)","price":147.0,"cat":"C1. SFP Transceivers"}];

const DISCOUNTS = [{"cat":"A1.1 GL800 Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A1.2 GL9000 Headend Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.15,"emeaEndUser":0.1},{"cat":"A1.3 GL9000 CPEs","naReseller":0.1,"naEndUser":0.05,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.05},{"cat":"A1.4 GL900 Headend Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.15,"emeaEndUser":0.1},{"cat":"A1.5 GL900 CPEs","naReseller":0.1,"naEndUser":0.05,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.05},{"cat":"A2. ML600 Family","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A2.1 ML600D Family","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.1 Shelves","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.2 SDU (Service Dispatch Units)","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.3 MLU (Multiport Line Units)","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.4 CHS-200 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.5 CHS-2000 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"C1. SFP Transceivers","naReseller":0.1,"naEndUser":0.0,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.0},{"cat":"C4.1 DSL Cables","naReseller":0.1,"naEndUser":0.0,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.0}];

const EMEA_IDS = [4,2,3];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const P  = pn => PRICE_LIST.find(p => p.pn === pn);
const $  = n  => n == null ? "—" : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PCT = n => (n * 100).toFixed(0) + "%";

function getDisc(cat, rid, ct, dr) {
  const d = DISCOUNTS.find(r => r.cat === cat);
  if (!d) return 0;
  const emea = EMEA_IDS.includes(rid), eu = ct === "End Customer";
  let v = emea ? (eu ? d.emeaEndUser : d.emeaReseller) : (eu ? d.naEndUser : d.naReseller);
  if (!emea && dr) v = Math.min(v + (d.regBonus || 0), 1);
  return v;
}

function makeLines(bomItems, rid, ct, dr) {
  return bomItems.map(item => ({
    ...item,
    listPrice: item.price || 0,
    discount:  getDisc(item.cat, rid, ct, dr),
  }));
}

// ─── SFP options ──────────────────────────────────────────────────────────────
const SFP_OPTIONS = [
  { pn: "506R00002",  desc: "1000Base-LX SMF (10km)" },
  { pn: "506R00012",  desc: "1000Base-SX MMF (500m)" },
  { pn: "506R00022",  desc: "100Base-FX MMF (2km)" },
  { pn: "506R00032",  desc: "100Base-FX SMF (15km)" },
  { pn: "506R00042",  desc: "1000Base-T SFP" },
  { pn: "506R61154",  desc: "2500Base-FX SMF (30km)" },
  { pn: "506R61155",  desc: "2500Base-FX MMF (500m)" },
  { pn: "506R61213",  desc: "100/1000Base-T SFP" },
  { pn: "506R61235",  desc: "10G BASE-LR SFP+ (10km)" },
];

// ─── Deployment type definitions ──────────────────────────────────────────────
const DEPLOY_TYPES = [
  { key: "PTP_ML600",  icon: "⇌", label: "PTP — ML600",        desc: "Point-to-point. Choose any ML600 model and quantity. Can be 1 unit (single end) or paired CO+CPE." },
  { key: "PTMP_GL800", icon: "⚡", label: "PTMP — GL800",       desc: "GL830 or GL850L headend with up to 16 GL800 remote CPE units." },
  { key: "PTMP_GL900", icon: "📡", label: "PTMP — GL900",       desc: "GL904/GL908/GL916 headend with GL91/GL91T/GL92 CPE endpoints." },
  { key: "PTMP_GL9000",icon: "🌐", label: "PTMP — GL9000",      desc: "GL9110C or GL9104C headend with GL93C CPEs. G.hn wave 2 over coax." },
  { key: "PTMP_ML230", icon: "🏗", label: "ML230 / ML2300",     desc: "Chassis platform. Pick chassis, SDU, MLU cards, cables and accessories individually or use a pre-built bundle." },
];

// ─── WIZARD COMPONENT ─────────────────────────────────────────────────────────
function NodeWizard({ region, custType, dealReg, onAddLines, onClose }) {
  const [type, setType]   = useState(null);
  const [step, setStep]   = useState(0);

  // Shared selection state
  const [sel, setSel] = useState({
    siteName:    "",
    // PTP ML600
    ptpMode:     "pair",      // "pair" | "single"
    unitPn:      null,
    coQty:       1,
    cpeQty:      1,
    ptpSfpPn:    null,
    ptpSfpQty:   2,
    ptpAcc:      {},
    // GL800 / GL900 / GL9000
    headendPn:   null,
    headendQty:  1,
    cpePn:       null,
    remoteCpeQty:1,
    glSfpPn:     null,
    glAcc:       {},
    // ML230 / ML2300
    ml230mode:   "custom",    // "bundle" | "custom"
    bundlePn:    null,
    bundleQty:   1,
    chassisPn:   null,
    sduPn:       null,
    mluPn:       null,
    mluQty:      1,
    cablePn:     null,
    cableQty:    1,
    ml230SfpPn:  null,
    ml230SfpQty: 2,
    ml230Acc:    {},
  });

  const set = (k, v) => setSel(prev => ({ ...prev, [k]: v }));
  const setAcc = (key, pn, v) => setSel(prev => ({ ...prev, [key]: { ...prev[key], [pn]: v } }));

  const isNA = !EMEA_IDS.includes(region?.id || 6);
  const rid  = region?.id || 6;

  // ── BOM builder ─────────────────────────────────────────────────────────────
  const bom = useMemo(() => {
    if (!type) return [];
    const items = [];

    if (type === "PTP_ML600") {
      const unit = P(sel.unitPn);
      if (unit) {
        if (sel.ptpMode === "pair") {
          items.push({ ...unit, desc: unit.desc + " — CO end",  qty: sel.coQty });
          items.push({ ...unit, desc: unit.desc + " — CPE end", qty: sel.cpeQty });
        } else {
          items.push({ ...unit, qty: sel.coQty });
        }
      }
      if (sel.ptpSfpPn) {
        const sfp = P(sel.ptpSfpPn);
        if (sfp) items.push({ ...sfp, qty: sel.ptpSfpQty });
      }
      // Power supplies
      const psNA = "506R00006", psEU = "506R00006E";
      if (sel.ptpAcc[psNA] || sel.ptpAcc[psEU]) {
        const psPn = isNA ? psNA : psEU;
        const ps = P(psPn);
        const totalUnits = sel.ptpMode === "pair" ? sel.coQty + sel.cpeQty : sel.coQty;
        if (ps) items.push({ ...ps, qty: totalUnits });
      }
      Object.entries(sel.ptpAcc).forEach(([pn, on]) => {
        if (!on || pn === psNA || pn === psEU) return;
        const prod = P(pn);
        if (prod) {
          const totalUnits = sel.ptpMode === "pair" ? sel.coQty + sel.cpeQty : sel.coQty;
          const qty = (pn === "510R21080" || pn === "510K00060") ? totalUnits : 1;
          items.push({ ...prod, qty });
        }
      });
    }

    else if (type === "PTMP_GL800" || type === "PTMP_GL900" || type === "PTMP_GL9000") {
      const hd = P(sel.headendPn);
      if (hd) items.push({ ...hd, qty: sel.headendQty });
      const cpe = P(sel.cpePn);
      if (cpe) items.push({ ...cpe, qty: sel.remoteCpeQty });
      if (sel.glSfpPn) {
        const sfp = P(sel.glSfpPn);
        if (sfp) items.push({ ...sfp, qty: sel.headendQty });
      }
      // Power supplies per-unit
      const psuNA = type === "PTMP_GL800" ? "506R00013"  : "506R00008";
      const psuEU = type === "PTMP_GL800" ? "506R00013E" : "506R00008U";
      if (sel.glAcc[psuNA] || sel.glAcc[psuEU]) {
        const psPn = isNA ? psuNA : psuEU;
        const ps = P(psPn);
        if (ps) items.push({ ...ps, qty: sel.headendQty + sel.remoteCpeQty });
      }
      Object.entries(sel.glAcc).forEach(([pn, on]) => {
        if (!on || pn === psuNA || pn === psuEU) return;
        const prod = P(pn);
        if (prod) {
          const qty = pn === "510R21080" ? sel.headendQty + sel.remoteCpeQty : 1;
          items.push({ ...prod, qty });
        }
      });
    }

    else if (type === "PTMP_ML230") {
      if (sel.ml230mode === "bundle") {
        const b = P(sel.bundlePn);
        if (b) items.push({ ...b, qty: sel.bundleQty });
      } else {
        const chassis = P(sel.chassisPn);
        if (chassis) items.push({ ...chassis, qty: 1 });
        const sdu = P(sel.sduPn);
        if (sdu) items.push({ ...sdu, qty: 1 });
        const mlu = P(sel.mluPn);
        if (mlu) items.push({ ...mlu, qty: sel.mluQty });
        const cable = P(sel.cablePn);
        if (cable) items.push({ ...cable, qty: sel.cableQty });
        if (sel.ml230SfpPn) {
          const sfp = P(sel.ml230SfpPn);
          if (sfp) items.push({ ...sfp, qty: sel.ml230SfpQty });
        }
        Object.entries(sel.ml230Acc).forEach(([pn, on]) => {
          if (!on) return;
          const prod = P(pn);
          if (prod) items.push({ ...prod, qty: 1 });
        });
      }
    }

    return items;
  }, [sel, type, isNA]);

  const bomLines  = useMemo(() => makeLines(bom, rid, custType, dealReg), [bom, rid, custType, dealReg]);
  const bomTotal  = bomLines.reduce((s, l) => s + l.price * l.qty * (1 - l.discount), 0);
  const bomList   = bomLines.reduce((s, l) => s + l.price * l.qty, 0);

  const N = "#0B1D3A", A = "#D97706";

  // ── Step counts per type ─────────────────────────────────────────────────────
  const STEP_LABELS = {
    PTP_ML600:   ["Type","Unit","Qty & Mode","SFPs","Accessories","Review"],
    PTMP_GL800:  ["Type","Headend","CPEs","SFPs","Accessories","Review"],
    PTMP_GL900:  ["Type","Headend","CPEs","SFPs","Accessories","Review"],
    PTMP_GL9000: ["Type","Headend","CPEs","SFPs","Accessories","Review"],
    PTMP_ML230:  ["Type","Mode","Components","Cables & SFPs","Accessories","Review"],
  };
  const steps = type ? (STEP_LABELS[type] || []) : ["Type"];

  const canNext = () => {
    if (step === 0) return !!type;
    if (type === "PTP_ML600") {
      if (step === 1) return !!sel.unitPn;
    }
    if (type === "PTMP_GL800" || type === "PTMP_GL900" || type === "PTMP_GL9000") {
      if (step === 1) return !!sel.headendPn;
      if (step === 2) return !!sel.cpePn;
    }
    if (type === "PTMP_ML230") {
      if (step === 2) {
        if (sel.ml230mode === "bundle") return !!sel.bundlePn;
        return !!sel.chassisPn && !!sel.sduPn && !!sel.mluPn;
      }
    }
    return true;
  };

  const handleAdd = () => {
    const lines = bomLines.map(l => ({
      pn: l.pn, desc: l.desc, cat: l.cat, qty: l.qty,
      listPrice: l.price, discount: l.discount, site: sel.siteName,
    }));
    onAddLines(lines);
    onClose();
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => { if (step <= 1) { setType(null); setStep(0); } else setStep(s => s - 1); };

  // ── Sub-components ──────────────────────────────────────────────────────────
  const ML600_STD  = ["501RG0016","501RG0046","501RG0067","501RG0076","501RG0077","501RG0078","501RG0106","501RG0111","501RG0115","501RG0116","501RG0121","501RG0122","501RG0217","501RG0218","501RG0238","501RG0253","501RG0254","501RG0259"];
  const ML600D     = ["501RG3230","501RG3231","501RG3240","501RG0232","501RG3255","501RG3256","501RG3355","501RG3356","501RG3358","501RG3376","501RG3378"];
  const GL800_HDS  = [["GL830 (8-port)", ["501RG0140","501RG0144"]], ["GL830 (16-port)", ["501RG0139","501RG0143"]], ["GL850L (16-port)", ["501RG0134","501RG0135"]]];
  const GL900_HDS  = ["501RG0167","501RG0168","501RG0303","501RG0301","501RG0302","501RG0300"];
  const GL900_CPES = ["506R61245","501S61245E","501S61245U","501S61246","501S61246E","501S61247"];
  const GL9000_HDS = ["506R61334","506R61342","506R61335"];
  const GL9000_CPES= ["506R61337","506R61336"];

  const ML230_BUNDLES = [
    { pn:"501S20436", label:"ML230: CHS-200 + SDU-450  + MLU-64DR" },
    { pn:"501S20441", label:"ML230: CHS-200 + SDU-450  + MLU-64DF" },
    { pn:"501S20443", label:"ML230: CHS-200 + SDU-450  + MLU-32DR" },
    { pn:"501S20442", label:"ML230: CHS-200 + SDU-450  + MLU-32DF" },
    { pn:"501S20444", label:"ML230: CHS-200 + SDU-450G + MLU-64DF" },
    { pn:"501S20435", label:"ML2300: CHS-2000B + SDU-450  + MLU-64DR" },
    { pn:"501S20447", label:"ML2300: CHS-2000B + SDU-450  + MLU-64DF" },
    { pn:"501S20449", label:"ML2300: CHS-2000B + SDU-450  + MLU-32DR" },
    { pn:"501S20448", label:"ML2300: CHS-2000B + SDU-450  + MLU-32DF" },
    { pn:"501S20450", label:"ML2300: CHS-2000B + SDU-450G + MLU-64DF" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(11,29,58,0.7)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(3px)" }}>
      <div style={{ background:"white", borderRadius:14, width:"min(740px,95vw)", maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

        {/* Header */}
        <div style={{ background:N, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ color:A, fontWeight:800, fontSize:13, letterSpacing:"0.06em" }}>⚡ NODE CONFIGURATOR</div>
            {type && <div style={{ color:"#94A3B8", fontSize:11, marginTop:2 }}>{DEPLOY_TYPES.find(d=>d.key===type)?.label}</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Step progress */}
            {type && steps.map((s,i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background: i < step ? "#10B981" : i === step ? A : "#1E3A5F", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"white" }}>{i < step ? "✓" : i+1}</div>
                {i < steps.length - 1 && <div style={{ width:12, height:1, background:"#1E3A5F" }} />}
              </div>
            ))}
            <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748B", fontSize:22, cursor:"pointer", marginLeft:8 }}>×</button>
          </div>
        </div>

        {/* Site name bar */}
        <div style={{ background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", padding:"8px 20px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Site Label (optional):</span>
          <input value={sel.siteName} onChange={e=>set("siteName",e.target.value)}
            placeholder="e.g. Site A, Tower 3..."
            style={{ padding:"4px 8px", border:"1px solid #E2E8F0", borderRadius:5, fontSize:12, color:"#1A2035", outline:"none", width:180 }} />
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:20 }}>

          {/* ── STEP 0: Choose deployment type ── */}
          {step === 0 && (
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#1A2035", marginBottom:4 }}>Select Deployment Type</div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:16 }}>Choose the network topology to configure.</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {DEPLOY_TYPES.map(d => (
                  <button key={d.key} onClick={()=>{ setType(d.key); setStep(1); setSel(prev=>({...prev, siteName:prev.siteName})); }}
                    style={{ textAlign:"left", padding:"12px 14px", borderRadius:8, border:`2px solid ${type===d.key?A:"#E2E8F0"}`, background:type===d.key?"#FFFBEB":"white", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:20 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#1A2035" }}>{d.label}</div>
                      <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{d.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PTP ML600: Step 1 — Unit selection ── */}
          {step === 1 && type === "PTP_ML600" && (
            <div>
              <StepHeader title="Select ML600 Unit" sub="Choose the product model. Applies to both CO and CPE ends for PTP." />
              {[["ML600 Standard", ML600_STD], ["ML600D Series", ML600D]].map(([grp, pns]) => (
                <div key={grp} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", marginBottom:6 }}>{grp}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {pns.map(pn => <ProdBtn key={pn} pn={pn} selected={sel.unitPn} onSelect={pn=>set("unitPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PTP ML600: Step 2 — Qty & Mode ── */}
          {step === 2 && type === "PTP_ML600" && (
            <div>
              <StepHeader title="Quantity & Configuration Mode" sub="Choose how many units and whether to quote as a matched CO+CPE pair or individual units." />
              <div style={{ marginBottom:16 }}>
                <Label>Quoting Mode</Label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["pair","PTP Pair (CO + CPE)","Quote matched CO and CPE ends. Same unit model for both."],["single","Single Unit","Quote units individually — useful for replacement parts or one-sided quotes."]].map(([v,l,d])=>(
                    <button key={v} onClick={()=>set("ptpMode",v)}
                      style={{ flex:1, padding:"10px 12px", borderRadius:8, border:`2px solid ${sel.ptpMode===v?A:"#E2E8F0"}`, background:sel.ptpMode===v?"#FFFBEB":"white", cursor:"pointer", textAlign:"left" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#1A2035" }}>{l}</div>
                      <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{d}</div>
                    </button>
                  ))}
                </div>
              </div>
              {sel.ptpMode === "pair" ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <Label>CO End — Qty (sites)</Label>
                    <Counter v={sel.coQty} min={1} max={99} set={v=>set("coQty",v)} />
                  </div>
                  <div>
                    <Label>CPE End — Qty (sites)</Label>
                    <Counter v={sel.cpeQty} min={1} max={99} set={v=>set("cpeQty",v)} />
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Quantity</Label>
                  <Counter v={sel.coQty} min={1} max={999} set={v=>set("coQty",v)} />
                </div>
              )}
              {sel.unitPn && (
                <div style={{ marginTop:16, padding:"10px 14px", background:"#F8FAFC", borderRadius:8, fontSize:12, color:"#1A2035" }}>
                  <b>Selected:</b> {P(sel.unitPn)?.desc} ({sel.unitPn})
                  {sel.ptpMode === "pair"
                    ? <> — {sel.coQty} CO + {sel.cpeQty} CPE = <b>{sel.coQty + sel.cpeQty} units total</b></>
                    : <> — <b>{sel.coQty} units</b></>}
                </div>
              )}
            </div>
          )}

          {/* ── PTP ML600: Step 3 — SFPs ── */}
          {step === 3 && type === "PTP_ML600" && (
            <div>
              <StepHeader title="SFP Transceivers" sub="Optional. Select one SFP model and set the quantity needed." />
              <div style={{ marginBottom:12 }}>
                <button onClick={()=>set("ptpSfpPn",null)}
                  style={{ padding:"8px 14px", borderRadius:7, border:`2px solid ${!sel.ptpSfpPn?"#D97706":"#E2E8F0"}`, background:!sel.ptpSfpPn?"#FFFBEB":"white", cursor:"pointer", fontSize:13, fontWeight:600, color:"#1A2035" }}>
                  No SFP required
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                {SFP_OPTIONS.map(s => (
                  <button key={s.pn} onClick={()=>set("ptpSfpPn",s.pn)}
                    style={{ textAlign:"left", padding:"8px 12px", borderRadius:7, border:`2px solid ${sel.ptpSfpPn===s.pn?A:"#E2E8F0"}`, background:sel.ptpSfpPn===s.pn?"#FFFBEB":"white", cursor:"pointer" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#1A2035" }}>{s.desc}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                      <code style={{ fontSize:10, color:"#94A3B8" }}>{s.pn}</code>
                      <span style={{ fontSize:11, fontWeight:700, color:N }}>{$(P(s.pn)?.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
              {sel.ptpSfpPn && (
                <div style={{ marginTop:8 }}>
                  <Label>SFP Quantity</Label>
                  <Counter v={sel.ptpSfpQty} min={1} max={99} set={v=>set("ptpSfpQty",v)} />
                  <div style={{ fontSize:11, color:"#64748B", marginTop:4 }}>Tip: 2 SFPs per PTP link (one each end)</div>
                </div>
              )}
            </div>
          )}

          {/* ── PTP ML600: Step 4 — Accessories ── */}
          {step === 4 && type === "PTP_ML600" && (
            <div>
              <StepHeader title="Accessories" sub="Optional add-ons. Power supplies qty is automatically set per unit count." />
              {[
                { pn: isNA?"506R00006":"506R00006E", label:`AC-DC Power Supply (${isNA?"NA":"EU"})`, hint:"1 per unit" },
                { pn: "510K00060", label:"Accessories Kit for ML600/ML530", hint:"1 per unit" },
                { pn: "510R21080", label:"Wall Mount Kit", hint:"1 per unit" },
                { pn: "510R21070", label:"Rack Mount Sleeve Kit (2 units)", hint:"1 per 2 units" },
              ].map(acc => (
                <AccRow key={acc.pn} pn={acc.pn} label={acc.label} hint={acc.hint}
                  checked={!!sel.ptpAcc[acc.pn]} onChange={v=>setAcc("ptpAcc",acc.pn,v)} />
              ))}
            </div>
          )}

          {/* ── GL800: Step 1 — Headend ── */}
          {step === 1 && type === "PTMP_GL800" && (
            <div>
              <StepHeader title="Select GL800 Headend" sub="CO aggregation unit. Choose model based on port count and access direction." />
              {GL800_HDS.map(([grp, pns]) => (
                <div key={grp} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", marginBottom:6 }}>{grp}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {pns.map(pn => <ProdBtn key={pn} pn={pn} selected={sel.headendPn} onSelect={pn=>set("headendPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                  </div>
                </div>
              ))}
              {sel.headendPn && (
                <div style={{ marginTop:12 }}>
                  <Label>Headend Quantity</Label>
                  <Counter v={sel.headendQty} min={1} max={20} set={v=>set("headendQty",v)} />
                </div>
              )}
            </div>
          )}

          {/* ── GL900: Step 1 — Headend ── */}
          {step === 1 && type === "PTMP_GL900" && (
            <div>
              <StepHeader title="Select GL900 Headend" sub="GL904/GL908/GL916 headend aggregation unit." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                {GL900_HDS.map(pn => <ProdBtn key={pn} pn={pn} selected={sel.headendPn} onSelect={pn=>set("headendPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
              </div>
              {sel.headendPn && (
                <div style={{ marginTop:8 }}>
                  <Label>Headend Quantity</Label>
                  <Counter v={sel.headendQty} min={1} max={20} set={v=>set("headendQty",v)} />
                </div>
              )}
            </div>
          )}

          {/* ── GL9000: Step 1 — Headend ── */}
          {step === 1 && type === "PTMP_GL9000" && (
            <div>
              <StepHeader title="Select GL9000 Headend" sub="GL9110C or GL9104C — G.hn Wave 2 headend unit." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                {GL9000_HDS.map(pn => <ProdBtn key={pn} pn={pn} selected={sel.headendPn} onSelect={pn=>set("headendPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
              </div>
              {sel.headendPn && (
                <div>
                  <Label>Headend Quantity</Label>
                  <Counter v={sel.headendQty} min={1} max={20} set={v=>set("headendQty",v)} />
                </div>
              )}
            </div>
          )}

          {/* ── GL800/900/9000: Step 2 — CPEs ── */}
          {step === 2 && (type === "PTMP_GL800" || type === "PTMP_GL900" || type === "PTMP_GL9000") && (
            <div>
              <StepHeader title="Select CPE Unit" sub="Remote endpoint unit deployed at customer premises." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                {(type === "PTMP_GL900" ? GL900_CPES : type === "PTMP_GL9000" ? GL9000_CPES : GL900_CPES).map(pn =>
                  <ProdBtn key={pn} pn={pn} selected={sel.cpePn} onSelect={pn=>set("cpePn",pn)} region={region} custType={custType} dealReg={dealReg} />
                )}
              </div>
              {sel.cpePn && (
                <div>
                  <Label>CPE Quantity</Label>
                  <Counter v={sel.remoteCpeQty} min={1} max={256} set={v=>set("remoteCpeQty",v)} />
                </div>
              )}
            </div>
          )}

          {/* ── GL800/900/9000: Step 3 — SFPs ── */}
          {step === 3 && (type === "PTMP_GL800" || type === "PTMP_GL900" || type === "PTMP_GL9000") && (
            <div>
              <StepHeader title="Uplink SFP Transceivers" sub="Optional. SFP for the headend uplink port. Qty will match headend count." />
              <div style={{ marginBottom:12 }}>
                <button onClick={()=>set("glSfpPn",null)}
                  style={{ padding:"8px 14px", borderRadius:7, border:`2px solid ${!sel.glSfpPn?A:"#E2E8F0"}`, background:!sel.glSfpPn?"#FFFBEB":"white", cursor:"pointer", fontSize:13, fontWeight:600, color:"#1A2035" }}>
                  No SFP required
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {SFP_OPTIONS.map(s => (
                  <button key={s.pn} onClick={()=>set("glSfpPn",s.pn)}
                    style={{ textAlign:"left", padding:"8px 12px", borderRadius:7, border:`2px solid ${sel.glSfpPn===s.pn?A:"#E2E8F0"}`, background:sel.glSfpPn===s.pn?"#FFFBEB":"white", cursor:"pointer" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#1A2035" }}>{s.desc}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                      <code style={{ fontSize:10, color:"#94A3B8" }}>{s.pn}</code>
                      <span style={{ fontSize:11, fontWeight:700, color:N }}>{$(P(s.pn)?.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── GL800/900/9000: Step 4 — Accessories ── */}
          {step === 4 && (type === "PTMP_GL800" || type === "PTMP_GL900" || type === "PTMP_GL9000") && (
            <div>
              <StepHeader title="Accessories" sub="Power supplies are applied per total unit count (headend + CPEs)." />
              {type === "PTMP_GL800" && [
                { pn: isNA?"506R00013":"506R00013E", label:`GL800 Power Supply (${isNA?"NA":"EU"})`, hint:"1 per unit" },
                { pn: "510R21080", label:"Wall Mount Kit", hint:"1 per unit" },
              ].map(acc => <AccRow key={acc.pn} pn={acc.pn} label={acc.label} hint={acc.hint} checked={!!sel.glAcc[acc.pn]} onChange={v=>setAcc("glAcc",acc.pn,v)} />)}
              {(type === "PTMP_GL900" || type === "PTMP_GL9000") && [
                { pn: isNA?"506R00008":(region?.id===1?"506R00008U":"506R00008"), label:`GL900 Power Supply (${isNA?"NA":"EU/UK"})`, hint:"1 per unit" },
                { pn: "510R21080", label:"Wall Mount Kit", hint:"1 per unit" },
              ].map(acc => <AccRow key={acc.pn} pn={acc.pn} label={acc.label} hint={acc.hint} checked={!!sel.glAcc[acc.pn]} onChange={v=>setAcc("glAcc",acc.pn,v)} />)}
            </div>
          )}

          {/* ── ML230: Step 1 — Mode (bundle vs custom) ── */}
          {step === 1 && type === "PTMP_ML230" && (
            <div>
              <StepHeader title="Configuration Mode" sub="Use a pre-built bundle SKU or configure components individually." />
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                {[["bundle","Pre-built Bundle","Select a single bundle SKU (CHS + SDU + MLU). Fastest option."],["custom","Custom Build","Choose chassis, SDU, MLU, cables and accessories individually."]].map(([v,l,d])=>(
                  <button key={v} onClick={()=>set("ml230mode",v)}
                    style={{ flex:1, padding:"12px 14px", borderRadius:8, border:`2px solid ${sel.ml230mode===v?A:"#E2E8F0"}`, background:sel.ml230mode===v?"#FFFBEB":"white", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#1A2035" }}>{l}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ML230: Step 2 — Components ── */}
          {step === 2 && type === "PTMP_ML230" && sel.ml230mode === "bundle" && (
            <div>
              <StepHeader title="Select Bundle" sub="Pre-configured ML230 or ML2300 bundle. Includes chassis, SDU and MLU." />
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {ML230_BUNDLES.map(b => {
                  const prod = P(b.pn);
                  return (
                    <button key={b.pn} onClick={()=>set("bundlePn",b.pn)}
                      style={{ textAlign:"left", padding:"10px 14px", borderRadius:8, border:`2px solid ${sel.bundlePn===b.pn?A:"#E2E8F0"}`, background:sel.bundlePn===b.pn?"#FFFBEB":"white", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13, color:"#1A2035" }}>{b.label}</div>
                        <code style={{ fontSize:10, color:"#94A3B8" }}>{b.pn}</code>
                      </div>
                      <div style={{ fontWeight:700, color:N, fontSize:13 }}>{$(prod?.price)}</div>
                    </button>
                  );
                })}
              </div>
              {sel.bundlePn && (
                <div style={{ marginTop:12 }}>
                  <Label>Quantity</Label>
                  <Counter v={sel.bundleQty} min={1} max={20} set={v=>set("bundleQty",v)} />
                </div>
              )}
            </div>
          )}

          {step === 2 && type === "PTMP_ML230" && sel.ml230mode === "custom" && (
            <div>
              <StepHeader title="Select Components" sub="Choose chassis, SDU and MLU individually." />

              {/* Chassis */}
              <div style={{ marginBottom:14 }}>
                <Label>Chassis</Label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {["502R20230","502R02110"].map(pn => <ProdBtn key={pn} pn={pn} selected={sel.chassisPn} onSelect={pn=>set("chassisPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                </div>
              </div>

              {/* SDU */}
              <div style={{ marginBottom:14 }}>
                <Label>SDU (Service Dispatcher Unit)</Label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {["503R60042","503R60043"].map(pn => <ProdBtn key={pn} pn={pn} selected={sel.sduPn} onSelect={pn=>set("sduPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                </div>
              </div>

              {/* MLU */}
              <div style={{ marginBottom:8 }}>
                <Label>MLU (Multiport Line Unit)</Label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:8 }}>
                  {["503R20132","503R20164","503R20232","503R20264"].map(pn => <ProdBtn key={pn} pn={pn} selected={sel.mluPn} onSelect={pn=>set("mluPn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                </div>
                {sel.mluPn && (
                  <div>
                    <Label>MLU Quantity (CHS-2000B fits up to 2 MLUs)</Label>
                    <Counter v={sel.mluQty} min={1} max={sel.chassisPn==="502R02110"?2:1} set={v=>set("mluQty",v)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ML230: Step 3 — Cables & SFPs ── */}
          {step === 3 && type === "PTMP_ML230" && (
            <div>
              <StepHeader title="DSL Cables & SFPs" sub="Select DSL connection cables and optional uplink SFP." />

              {sel.ml230mode === "custom" && (
                <>
                  <div style={{ marginBottom:14 }}>
                    <Label>DSL Cable Type</Label>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:8 }}>
                      {["504R20110","504R20120"].map(pn => <ProdBtn key={pn} pn={pn} selected={sel.cablePn} onSelect={pn=>set("cablePn",pn)} region={region} custType={custType} dealReg={dealReg} />)}
                    </div>
                    {sel.cablePn && (
                      <div>
                        <Label>Cable Quantity</Label>
                        <Counter v={sel.cableQty} min={0} max={50} set={v=>set("cableQty",v)} />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label>Uplink SFP (optional)</Label>
                <div style={{ marginBottom:8 }}>
                  <button onClick={()=>set("ml230SfpPn",null)}
                    style={{ padding:"6px 12px", borderRadius:6, border:`2px solid ${!sel.ml230SfpPn?A:"#E2E8F0"}`, background:!sel.ml230SfpPn?"#FFFBEB":"white", cursor:"pointer", fontSize:12, fontWeight:600, color:"#1A2035" }}>
                    No SFP
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:8 }}>
                  {SFP_OPTIONS.map(s => (
                    <button key={s.pn} onClick={()=>set("ml230SfpPn",s.pn)}
                      style={{ textAlign:"left", padding:"7px 10px", borderRadius:7, border:`2px solid ${sel.ml230SfpPn===s.pn?A:"#E2E8F0"}`, background:sel.ml230SfpPn===s.pn?"#FFFBEB":"white", cursor:"pointer" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#1A2035" }}>{s.desc}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                        <code style={{ fontSize:10, color:"#94A3B8" }}>{s.pn}</code>
                        <span style={{ fontSize:11, fontWeight:700, color:N }}>{$(P(s.pn)?.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {sel.ml230SfpPn && (
                  <div>
                    <Label>SFP Quantity</Label>
                    <Counter v={sel.ml230SfpQty} min={1} max={20} set={v=>set("ml230SfpQty",v)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ML230: Step 4 — Accessories ── */}
          {step === 4 && type === "PTMP_ML230" && (
            <div>
              <StepHeader title="Accessories" sub="Optional add-ons for the chassis configuration." />
              {[
                { pn:"550A00046", label:"Flash Card for SDU-450/G" },
                { pn:"510K20230", label:"Accessories Kit for CHS-200", hide: sel.chassisPn === "502R02110" },
                { pn:"506R30070", label:"Fan Control Module for CHS-2000B", hide: sel.chassisPn === "502R20230" },
              ].filter(a => !a.hide).map(acc => (
                <AccRow key={acc.pn} pn={acc.pn} label={acc.label} checked={!!sel.ml230Acc[acc.pn]} onChange={v=>setAcc("ml230Acc",acc.pn,v)} />
              ))}
            </div>
          )}

          {/* ── REVIEW: last step for all types ── */}
          {step === steps.length - 1 && type && (
            <div>
              <StepHeader title="Review BOM" sub="Confirm the bill of materials before adding to quote." />

              {/* Site name */}
              <div style={{ marginBottom:12 }}>
                <Label>Site Label</Label>
                <input value={sel.siteName} onChange={e=>set("siteName",e.target.value)}
                  placeholder="Optional site name for grouping in quote"
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #E2E8F0", borderRadius:6, fontSize:13, color:"#1A2035", outline:"none" }} />
              </div>

              {/* BOM table */}
              <div style={{ border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden", marginBottom:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 50px 90px 60px 100px", padding:"7px 10px", background:"#0B1D3A", fontSize:10, fontWeight:700, color:"white", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                  <span>Part #</span><span>Description</span><span style={{textAlign:"center"}}>Qty</span><span style={{textAlign:"right"}}>List</span><span style={{textAlign:"center"}}>Disc</span><span style={{textAlign:"right"}}>Customer $</span>
                </div>
                {bomLines.length === 0 && (
                  <div style={{ padding:"20px", textAlign:"center", color:"#94A3B8", fontSize:13 }}>No items selected yet</div>
                )}
                {bomLines.map((l, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 50px 90px 60px 100px", padding:"8px 10px", borderTop:"1px solid #F1F5F9", alignItems:"center", background: i%2===0?"white":"#FAFBFF" }}>
                    <code style={{ fontSize:10, color:"#0B1D3A", fontWeight:700 }}>{l.pn}</code>
                    <span style={{ fontSize:12, color:"#1A2035" }}>{l.desc}</span>
                    <span style={{ textAlign:"center", fontSize:13, fontWeight:700 }}>{l.qty}</span>
                    <span style={{ textAlign:"right", fontSize:12, color:"#64748B" }}>{$(l.price)}</span>
                    <span style={{ textAlign:"center", fontSize:12, color:"#10B981", fontWeight:600 }}>{l.discount>0?`-${PCT(l.discount)}`:"—"}</span>
                    <span style={{ textAlign:"right", fontSize:13, fontWeight:700, color:"#0B1D3A" }}>{$(l.price * l.qty * (1 - l.discount))}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {bomLines.length > 0 && (
                <div style={{ display:"flex", justifyContent:"flex-end", gap:20, padding:"8px 10px" }}>
                  {bomList !== bomTotal && (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:11, color:"#64748B" }}>List Total</div>
                      <div style={{ fontSize:13, color:"#64748B" }}>{$(bomList)}</div>
                    </div>
                  )}
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, color:"#64748B" }}>Customer Total</div>
                    <div style={{ fontSize:16, fontWeight:800, color:A }}>{$(bomTotal)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding:"12px 20px", borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center", background:"white", flexShrink:0 }}>
          <button onClick={goBack}
            style={{ padding:"8px 18px", borderRadius:6, border:"1px solid #E2E8F0", background:"white", fontSize:13, cursor:"pointer", color:"#64748B" }}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {bomLines.length > 0 && (
              <span style={{ fontSize:12, color:"#64748B" }}>{bomLines.length} line{bomLines.length>1?"s":""} · {$(bomTotal)}</span>
            )}
            {step < steps.length - 1 ? (
              <button onClick={goNext} disabled={!canNext()}
                style={{ padding:"8px 22px", borderRadius:6, border:"none", fontSize:13, fontWeight:700,
                  background: canNext() ? "#D97706" : "#E2E8F0",
                  color: canNext() ? "white" : "#94A3B8",
                  cursor: canNext() ? "pointer" : "default" }}>
                Next →
              </button>
            ) : (
              <button onClick={handleAdd} disabled={bomLines.length === 0}
                style={{ padding:"8px 22px", borderRadius:6, border:"none", fontSize:13, fontWeight:700,
                  background: bomLines.length > 0 ? "#059669" : "#E2E8F0",
                  color: bomLines.length > 0 ? "white" : "#94A3B8",
                  cursor: bomLines.length > 0 ? "pointer" : "default" }}>
                ✓ Add {bomLines.length} line{bomLines.length!==1?"s":""} to Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────
function ProdBtn({ pn, selected, onSelect, region, custType, dealReg }) {
  const prod = P(pn);
  if (!prod) return null;
  const rid  = region?.id || 6;
  const disc = getDisc(prod.cat, rid, custType, dealReg);
  const custPrice = prod.price * (1 - disc);
  const active = selected === pn;
  return (
    <button onClick={() => onSelect(pn)}
      style={{ textAlign:"left", padding:"9px 11px", borderRadius:7, border:`2px solid ${active?"#D97706":"#E2E8F0"}`, background:active?"#FFFBEB":"white", cursor:"pointer" }}
      onMouseEnter={e=>{ if(!active){e.currentTarget.style.borderColor="#CBD5E1"; e.currentTarget.style.background="#FAFBFF";}}}
      onMouseLeave={e=>{ if(!active){e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="white";}}}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:active?700:500, color:"#0B1D3A" }}>{prod.desc}</div>
          <code style={{ fontSize:9, color:"#94A3B8" }}>{pn}</code>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0B1D3A" }}>{$(custPrice)}</div>
          {disc > 0 && <div style={{ fontSize:9, color:"#10B981" }}>-{PCT(disc)} off</div>}
        </div>
      </div>
    </button>
  );
}

function AccRow({ pn, label, hint, checked, onChange }) {
  const prod = P(pn);
  if (!prod) return null;
  return (
    <div onClick={() => onChange(!checked)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:7, border:`1px solid ${checked?"#D97706":"#E2E8F0"}`, background:checked?"#FFFBEB":"white", cursor:"pointer", marginBottom:6 }}>
      <Tog v={checked} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#1A2035" }}>{label}</div>
        {hint && <div style={{ fontSize:11, color:"#94A3B8" }}>{hint}</div>}
      </div>
      <div style={{ textAlign:"right" }}>
        <code style={{ fontSize:10, color:"#94A3B8", display:"block" }}>{pn}</code>
        <span style={{ fontSize:12, fontWeight:700, color:"#0B1D3A" }}>{$(prod.price)}</span>
      </div>
    </div>
  );
}

function StepHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontWeight:700, fontSize:15, color:"#1A2035" }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:"#64748B", marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{children}</div>;
}

function Counter({ v, min, max, set }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, border:"1px solid #E2E8F0", borderRadius:6, overflow:"hidden", width:"fit-content" }}>
      <button onClick={() => set(Math.max(min, v - 1))} style={{ width:32, height:32, background:"#F8FAFC", border:"none", cursor:"pointer", fontSize:18, color:"#374151", fontWeight:600 }}>−</button>
      <span style={{ width:44, textAlign:"center", fontSize:14, fontWeight:700, color:"#1A2035" }}>{v}</span>
      <button onClick={() => set(Math.min(max, v + 1))} style={{ width:32, height:32, background:"#F8FAFC", border:"none", cursor:"pointer", fontSize:18, color:"#374151", fontWeight:600 }}>+</button>
    </div>
  );
}

function Tog({ v }) {
  return (
    <div style={{ width:32, height:18, borderRadius:9, background:v?"#D97706":"#CBD5E1", position:"relative", flexShrink:0, transition:"background 0.15s" }}>
      <div style={{ width:14, height:14, borderRadius:"50%", background:"white", position:"absolute", top:2, left:v?16:2, transition:"left 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </div>
  );
}



// ═══════════════ QUOTE BUILDER (main app) ═══════════════

// ─── PRICE DATA — loaded from /prices.json, fallback to embedded ─────────────
const PRICE_LIST_FALLBACK = [{"pn":"199A10040","desc":"AC Power cord, Australian type (2.5m)","price":6.0,"cat":"C4.3 Power and Grounding cables"},{"pn":"501RG0016","desc":"ML622","price":1145.0,"cat":"A2. ML600 Family"},{"pn":"501RG0046","desc":"ML624","price":1720.0,"cat":"A2. ML600 Family"},{"pn":"501RG0067","desc":"ML638","price":2306.0,"cat":"A2. ML600 Family"},{"pn":"501RG0076","desc":"ML654S","price":3748.0,"cat":"A2. ML600 Family"},{"pn":"501RG0077","desc":"ML658S","price":4430.0,"cat":"A2. ML600 Family"},{"pn":"501RG0078","desc":"ML650SV","price":3308.0,"cat":"A2. ML600 Family"},{"pn":"501RG0106","desc":"ML684M","price":1950.0,"cat":"A2. ML600 Family"},{"pn":"501RG0111","desc":"ML6916EN","price":6554.0,"cat":"A2. ML600 Family"},{"pn":"501RG0115","desc":"ML6916EL","price":6665.0,"cat":"A2. ML600 Family"},{"pn":"501RG0116","desc":"ML644EL","price":3560.0,"cat":"A2. ML600 Family"},{"pn":"501RG0121","desc":"ML622i with 24/48Vdc","price":800.0,"cat":"A2. ML600 Family"},{"pn":"501RG0122","desc":"ML624i with 24/48Vdc","price":1260.0,"cat":"A2. ML600 Family"},{"pn":"501RG0134","desc":"GL850L-16O","price":4251.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0135","desc":"GL850L-16R","price":3917.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0139","desc":"GL830-16O","price":3748.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0140","desc":"GL830-8O","price":3148.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0143","desc":"GL830-16R","price":3330.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0144","desc":"GL830-8R","price":2921.0,"cat":"A1.1 GL800 Solutions"},{"pn":"501RG0167","desc":"GL904","price":1120.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0168","desc":"GL904-R","price":1410.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0217","desc":"ML648E","price":3031.0,"cat":"A2. ML600 Family"},{"pn":"501RG0218","desc":"ML6416E","price":4595.0,"cat":"A2. ML600 Family"},{"pn":"501RG0232","desc":"ML684DTP","price":2295.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG0238","desc":"ML6916E (w/o SyncE)","price":6090.0,"cat":"A2. ML600 Family"},{"pn":"501RG0253","desc":"ML698ES","price":5055.0,"cat":"A2. ML600 Family"},{"pn":"501RG0254","desc":"ML6916ES","price":6550.0,"cat":"A2. ML600 Family"},{"pn":"501RG0259","desc":"ML698E","price":3679.0,"cat":"A2. ML600 Family"},{"pn":"501RG0300","desc":"GL916-R","price":2230.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0301","desc":"GL908-R","price":1680.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0302","desc":"GL916","price":1950.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0303","desc":"GL908","price":1380.0,"cat":"A1.4 GL900 Headend Solutions"},{"pn":"501RG0530","desc":"ML530","price":920.0,"cat":"A5.3 Fiber Rackmount L2 Switches"},{"pn":"501RG2097","desc":"XR239SE Repeater - No Rewiring","price":1260.0,"cat":"A6. Repeater Related Products"},{"pn":"501RG3230","desc":"ML684D (New)","price":1950.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3231","desc":"ML680DF (New)","price":953.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3240","desc":"ML622D (New)","price":1374.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3255","desc":"ML684D-M (12/24V)","price":1995.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3256","desc":"ML684D-M (48/60V)","price":1995.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3355","desc":"ML684DL-M (12/24V)","price":2795.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3356","desc":"ML684DL-M (48/60V)","price":2795.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3358","desc":"ML684DLP-M","price":2989.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3376","desc":"ML680DL-M (48/60V)","price":2019.0,"cat":"A2.1 ML600D Family"},{"pn":"501RG3378","desc":"ML680DLP-M","price":1410.0,"cat":"A2.1 ML600D Family"},{"pn":"501S20435","desc":"ML2300 Bundle: CHS-2000B + SDU-450 + MLU-64DR","price":22523.0,"cat":"A4.7 ML2300 Configuration Examples"},{"pn":"501S20436","desc":"ML230 Bundle: CHS-200 + SDU-450 + MLU-64DR","price":20666.0,"cat":"A4.6 ML230 Configuration Examples"},{"pn":"501S20441","desc":"ML230 Bundle: CHS-200 + SDU-450 + MLU-64DF","price":20666.0,"cat":"A4.6 ML230 Configuration Examples"},{"pn":"501S20442","desc":"ML230 Bundle: CHS-200 + SDU-450 + MLU-32DF","price":17797.0,"cat":"A4.6 ML230 Configuration Examples"},{"pn":"501S20443","desc":"ML230 Bundle: CHS-200 + SDU-450 + MLU-32DR","price":17797.0,"cat":"A4.6 ML230 Configuration Examples"},{"pn":"501S61245E","desc":"GL91 (EU/US)","price":150.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61246","desc":"GL91T","price":120.0,"cat":"A1.5 GL900 CPEs"},{"pn":"501S61247","desc":"GL91T-RB","price":195.0,"cat":"A1.5 GL900 CPEs"},{"pn":"502R02110","desc":"Chassis 2000B Shelf (CHS-2000B/19)","price":2985.0,"cat":"A4.1 Shelves"},{"pn":"502R20230","desc":"Chassis 200 Shelf","price":1127.0,"cat":"A4.1 Shelves"},{"pn":"503R20132","desc":"MLU-32DF (32 copper pairs, front access)","price":6325.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20164","desc":"MLU-64DF (64 copper pairs, front access)","price":9195.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20232","desc":"MLU-32DR (32 copper pairs, rear access)","price":6325.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R20264","desc":"MLU-64DR (64 copper pairs, rear access)","price":9195.0,"cat":"A4.3 MLU (Multiport Line Units)"},{"pn":"503R60042","desc":"Service Dispatcher Unit (SDU-450)","price":10345.0,"cat":"A4.2 SDU (Service Dispatch Units)"},{"pn":"503R60043","desc":"Service Dispatcher Unit (SDU-450G)","price":11495.0,"cat":"A4.2 SDU (Service Dispatch Units)"},{"pn":"503RG3088","desc":"ABA LP ER 2.0","price":863.0,"cat":"A8.1 BBA Cards"},{"pn":"503RG3104","desc":"VBA 3.0","price":920.0,"cat":"A8.1 BBA Cards"},{"pn":"503RG3107","desc":"VBA 3.0E","price":966.0,"cat":"A8.1 BBA Cards"},{"pn":"503RG3110","desc":"ABA 3.0","price":805.0,"cat":"A8.1 BBA Cards"},{"pn":"503RG3111","desc":"ABA 3.0E","price":851.0,"cat":"A8.1 BBA Cards"},{"pn":"504R20110","desc":"DSL Quad Cable, 4xRJ-45, 10ft/3m","price":46.0,"cat":"C4.1 DSL Cables"},{"pn":"504R20120","desc":"DSL Octal Cable, 8xRJ-45, 10ft/3m","price":69.0,"cat":"C4.1 DSL Cables"},{"pn":"506R00002","desc":"1000Base-LX SMF SFP module (10km)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00006","desc":"AC-DC power supply for ML600/ML740/ML530 (NA)","price":110.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00006E","desc":"AC-DC power supply for ML600/ML740/ML530 (EU)","price":110.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00008","desc":"AC-DC power supply for GL900 (NA)","price":58.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00008U","desc":"AC-DC power supply for GL900 (UK)","price":58.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00012","desc":"1000Base-SX MMF SFP module (500m)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00013","desc":"AC/DC power supply for GL800 (NA)","price":138.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00013E","desc":"AC/DC power supply for GL800 (EU)","price":138.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R00022","desc":"100Base-FX MMF SFP module (2km)","price":115.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00032","desc":"100Base-FX SMF SFP module (15km)","price":68.0,"cat":"C1. SFP Transceivers"},{"pn":"506R00042","desc":"1000Base-T SFP module","price":103.0,"cat":"C1. SFP Transceivers"},{"pn":"506R0116R","desc":"ML632R","price":1299.0,"cat":"A9. L3 CPEs"},{"pn":"506R0146R","desc":"ML634R","price":2297.0,"cat":"A9. L3 CPEs"},{"pn":"506R30070","desc":"Fan Control Module for CHS-2000B/19","price":685.0,"cat":"A4.5 CHS-2000 Related Items"},{"pn":"506R61154","desc":"2500Base-FX SMF SFP (30Km)","price":289.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61155","desc":"2500Base-FX MMF SFP (500m)","price":127.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61181","desc":"DIN Rail PSU 24VDC for ML600Dx","price":156.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61184","desc":"DIN Rail PSU 24VDC + EU Cables","price":184.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61185","desc":"DIN Rail PSU 24VDC + US Cables","price":184.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61191","desc":"DIN Rail PSU 48VDC with PoE","price":225.0,"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700"},{"pn":"506R61213","desc":"100/1000Base-T SFP","price":103.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61235","desc":"10G BASE-LR SFP+ Module (10Km)","price":147.0,"cat":"C1. SFP Transceivers"},{"pn":"506R61245","desc":"GL91","price":110.0,"cat":"A1.5 GL900 CPEs"},{"pn":"506R61334","desc":"GL9110C","price":1800.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R61335","desc":"GL901CS","price":162.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R61336","desc":"GL93C-W","price":257.0,"cat":"A1.3 GL9000 CPEs"},{"pn":"506R61337","desc":"GL93C","price":110.0,"cat":"A1.3 GL9000 CPEs"},{"pn":"506R61342","desc":"GL9104C","price":1550.0,"cat":"A1.2 GL9000 Headend Solutions"},{"pn":"506R62006","desc":"ML540M AC","price":1680.0,"cat":"A5.3 Fiber Rackmount L2 Switches"},{"pn":"506R62016","desc":"ML540M DC","price":1460.0,"cat":"A5.3 Fiber Rackmount L2 Switches"},{"pn":"510K00060","desc":"Accessories Kit for ML600/ML700/ML530","price":23.0,"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items"},{"pn":"510K20230","desc":"Accessories Kit for CHS-200","price":115.0,"cat":"A4.4 CHS-200 Related Items"},{"pn":"510R21080","desc":"Wall Mount Kit for ML600/ML700/GL800/GL900","price":52.0,"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items"},{"pn":"550A00046","desc":"Flash Card for SDU-450/G","price":173.0,"cat":"A4.5 CHS-2000 Related Items"},{"pn":"EMSL00109","desc":"EMS perpetual SNMP NB Interface License","price":25000.0,"cat":"B2.3 MetaASSIST EMS Feature Licenses"},{"pn":"EMSL00113","desc":"EMS Annual SNMP NE Licenses - up to 10 Devices","price":200.0,"cat":"B2.2 MetaASSIST EMS NE License Keys"},{"pn":"EMSL00114","desc":"EMS Annual SNMP NE Licenses - up to 50 Devices","price":1000.0,"cat":"B2.2 MetaASSIST EMS NE License Keys"},{"pn":"EMSL00115","desc":"EMS Annual SNMP NE Licenses - up to 100 Devices","price":1800.0,"cat":"B2.2 MetaASSIST EMS NE License Keys"},{"pn":"EMSL40001","desc":"MetaASSIST EMS perpetual Site license up to 100 devices","price":10000.0,"cat":"B2.1 MetaASSIST EMS Site Licenses"},{"pn":"EMSL40100","desc":"EMS annual Node license ML600/ML500/ML700 bundle of 10","price":750.0,"cat":"B2.2 MetaASSIST EMS NE License Keys"},{"pn":"EMSL40107","desc":"EMS annual Node license ML2300/ML230 bundle of 5","price":950.0,"cat":"B2.2 MetaASSIST EMS NE License Keys"}];
const DISCOUNTS_FALLBACK = [{"cat":"A1.1 GL800 Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A1.2 GL9000 Headend Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.15,"emeaEndUser":0.1},{"cat":"A1.3 GL9000 CPEs","naReseller":0.1,"naEndUser":0.05,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.05},{"cat":"A1.4 GL900 Headend Solutions","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.15,"emeaEndUser":0.1},{"cat":"A1.5 GL900 CPEs","naReseller":0.1,"naEndUser":0.05,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.05},{"cat":"A2. ML600 Family","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A2.1 ML600D Family","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A3.1 Power Supplies for GL800/GL900/ML500/ML600/ML700","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A3.2 GL800/GL900ML500/ML600/ML700 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.1 Shelves","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.2 SDU (Service Dispatch Units)","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.3 MLU (Multiport Line Units)","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.4 CHS-200 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.5 CHS-2000 Related Items","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.6 ML230 Configuration Examples","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A4.7 ML2300 Configuration Examples","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"A8.1 BBA Cards","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.4,"emeaEndUser":0.3},{"cat":"B2.1 MetaASSIST EMS Site Licenses","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.3,"emeaEndUser":0.2},{"cat":"B2.2 MetaASSIST EMS NE License Keys","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.3,"emeaEndUser":0.2},{"cat":"B2.3 MetaASSIST EMS Feature Licenses","naReseller":0.33,"naEndUser":0.33,"regBonus":0.07,"emeaReseller":0.3,"emeaEndUser":0.2},{"cat":"C1. SFP Transceivers","naReseller":0.1,"naEndUser":0.0,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.0},{"cat":"C4.1 DSL Cables","naReseller":0.1,"naEndUser":0.0,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.0},{"cat":"C4.3 Power and Grounding cables","naReseller":0.1,"naEndUser":0.0,"regBonus":0.0,"emeaReseller":0.1,"emeaEndUser":0.0}];
const SVC_FALLBACK = [{"pn":"SVC-ADVREP","desc":"Advanced HW Replacement Service","lpString":"5% of Purchase Price / yr","listPrice":0.05,"cat":"D2.1 Extended Warranty"},{"pn":"SVC-BRONZE","desc":"Bronze Support","lpString":"4% of Purchase Price / yr","listPrice":0.04,"cat":"D2.2 Support Programs"},{"pn":"SVC-GOLD","desc":"Gold Support","lpString":"6% of Purchase Price / yr","listPrice":0.06,"cat":"D2.2 Support Programs"},{"pn":"SVC-GOLD+","desc":"Gold Plus Support","lpString":"9% of Purchase Price / yr","listPrice":0.09,"cat":"D2.2 Support Programs"},{"pn":"SVC-PLAT","desc":"Platinum Support","lpString":"8% of Purchase Price / yr","listPrice":0.08,"cat":"D2.2 Support Programs"},{"pn":"SVC-REM1YR","desc":"Telephone Assistance, per year","lpString":"1.5% of Purchase Price / yr","listPrice":0.015,"cat":"D2.1 Extended Warranty"},{"pn":"SVC-EXTHW1","desc":"Extended FR&R HW Warranty","lpString":"2% of Purchase Price / yr","listPrice":0.02,"cat":"D2.1 Extended Warranty"},{"pn":"SVC-NETANA","desc":"Network Analysis","lpString":"$350/hr + expenses","listPrice2":350,"cat":"D2.5 Prof. Services"},{"pn":"SVC-ONSINS","desc":"Onsite Installation Assistance","lpString":"$2,500/day + T&E","listPrice2":2500,"cat":"D2.5 Prof. Services"}];


const REGIONS_MAIN = [{id:4,name:"EMEA"},{id:6,name:"NA"},{id:5,name:"Enterprise"},{id:2,name:"APAC"},{id:3,name:"CALA"}];
const EMEA_IDS_MAIN = [4,2,3];
const PAYMENTS = ["Net 30 days","Net 45 days","Net 60 days","Net 90 days","Net 120 days","Net 150 days","Pre-Paid"];
const SHIPPINGS = ["ExWorks","FOB","FOB Destination","DDU","DDP","FCA IL, Rosh Haayin"];
const STATUSES = ["New","In Progress","Ready","Approved","Submitted"];
const SC = {New:"#3B82F6","In Progress":"#F59E0B",Ready:"#10B981",Approved:"#059669",Submitted:"#8B5CF6"};

function getDiscMain(cat,rid,ct,dr,discArr){
  const d=(discArr||[]).find(r=>r.cat===cat);
  if(!d)return 0;
  const e=EMEA_IDS_MAIN.includes(rid),eu=ct==="End Customer";
  let v=e?(eu?d.emeaEndUser:d.emeaReseller):(eu?d.naEndUser:d.naReseller);
  if(!e&&dr)v=Math.min(v+d.regBonus,1);
  return v;
}

const $M=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n||0);
const PM=n=>(n*100).toFixed(1)+"%";
const TDM=()=>new Date().toISOString().split("T")[0];
const ADM=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().split("T")[0];};
let _quid=1000;

export default function QuoteApp(){
  const[qn,setQn]=useState("");const[cust,setCust]=useState("");const[cont,setCont]=useState("");
  const[qby,setQby]=useState("");const[dt,setDt]=useState(TDM());const[exp,setExp]=useState(ADM(TDM(),30));
  const[reg,setReg]=useState(REGIONS_MAIN[0]);const[ct,setCt]=useState("Reseller");const[dr,setDr]=useState(false);
  const[pay,setPay]=useState("Net 30 days");const[ship,setShip]=useState("ExWorks");const[stat,setStat]=useState("New");
  const[cmts,setCmts]=useState("");const[lines,setLines]=useState([]);const[srch,setSrch]=useState("");
  const[drop,setDrop]=useState(false);const[tab,setTab]=useState("hw");
  const[aShip,setAShip]=useState(false);const[aCC,setACC]=useState(false);
  const[aTax,setATax]=useState(false);const[tax,setTax]=useState(6);
  const[showWizard,setShowWizard]=useState(false);
  const[showAdmin,setShowAdmin]=useState(false);

  // Dynamic price data — loads from public/prices.json, falls back to embedded
  const[priceList,setPriceList]=useState(PRICE_LIST_FALLBACK);
  const[discounts,setDiscounts]=useState(DISCOUNTS_FALLBACK);
  const[services,setServices]=useState(SVC_FALLBACK);
  const[pricesMeta,setPricesMeta]=useState({version:"3.21",updated:"(embedded)"});

  useEffect(()=>{
    fetch("prices.json")
      .then(r=>r.ok?r.json():null)
      .then(d=>{
        if(d?.priceList?.length){
          setPriceList(d.priceList);
          if(d.discounts?.length) setDiscounts(d.discounts);
          if(d.services?.length)  setServices(d.services);
          setPricesMeta({version:d.version||"",updated:d.updated||""});
        }
      })
      .catch(()=>{});
  },[]);

  const [exporting, setExporting] = useState(false);

  const exportPdf = useCallback(() => {
    setExporting(true);
    try {
      exportQuotePDF({
        quote_num: qn || "DRAFT", status: stat, quoted_by: qby,
        date: dt, expiry: exp, customer: cust, contact: cont,
        customer_type: ct, region: reg.name, payment: pay,
        shipping: ship, deal_reg: dr, comments: cmts,
        lines: lines.map(l => ({
          pn: l.pn, desc: l.desc, cat: l.cat, qty: l.qty,
          list_price: l.listPrice, discount: l.discount,
          site: l.site || "", is_svc: !!(l.isD), svc_string: l.lpStr || "",
        })),
        add_ship: aShip, add_cc: aCC, add_tax: aTax, tax_rate: tax,
      });
    } catch(err) {
      alert("PDF export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  }, [qn, stat, qby, dt, exp, cust, cont, ct, reg, pay, ship, dr, cmts, lines, aShip, aCC, aTax, tax]);



  const isNA=!EMEA_IDS_MAIN.includes(reg.id);

  const res=useMemo(()=>{
    if(!srch.trim())return[];
    const q=srch.toLowerCase();
    return(tab==="hw"?priceList:services).filter(p=>p.pn.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||(p.cat||"").toLowerCase().includes(q)).slice(0,22);
  },[srch,tab]);

  const addItem=useCallback(p=>{
    const disc=getDiscMain(p.cat,reg.id,ct,dr,discounts);
    setLines(prev=>[...prev,{id:_quid++,pn:p.pn,desc:p.desc,cat:p.cat,qty:1,listPrice:p.price||0,discount:disc,site:"",lpStr:p.lpString||""}]);
    setSrch("");setDrop(false);
  },[reg,ct,dr]);

  const addWizardLines=useCallback(newLines=>{
    setLines(prev=>[...prev,...newLines.map(l=>({...l,id:_quid++}))]);
  },[]);

  const upd=(id,f,v)=>setLines(p=>p.map(l=>l.id===id?{...l,[f]:v}:l));
  const rm=id=>setLines(p=>p.filter(l=>l.id!==id));

  const hwT=useMemo(()=>lines.reduce((s,l)=>s+l.listPrice*l.qty*(1-l.discount),0),[lines]);
  const lstT=lines.reduce((s,l)=>s+l.listPrice*l.qty,0);
  const shpA=aShip?hwT*0.02:0,ccA=aCC?hwT*0.03:0,txA=aTax&&isNA?hwT*(tax/100):0;
  const grand=hwT+shpA+ccA+txA;
  const cg=useMemo(()=>{const g={};lines.forEach(l=>{const k=l.cat.split(" ")[0];(g[k]=g[k]||[]).push(l);});return g;},[lines]);

  const N="#0B1D3A",A="#D97706",B="#E2E8F0",T="#1A2035",M="#64748B";
  const inp={width:"100%",padding:"9px 11px",border:`1px solid ${B}`,borderRadius:5,fontSize:14,color:T,background:"white",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

  return(
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#F4F6FA",minHeight:"100vh",color:T,fontSize:13}}>

      {showAdmin && (
        <AdminUpload
          onClose={()=>setShowAdmin(false)}
          currentPrices={priceList}
          currentDiscounts={discounts}
          currentServices={services}
        />
      )}

      {showWizard && (
        <NodeWizard
          region={reg} custType={ct} dealReg={dr}
          onAddLines={addWizardLines}
          onClose={()=>setShowWizard(false)}
        />
      )}

      {/* NAV */}
      <div style={{background:N,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <img src="https://actelis.com/wp-content/uploads/2021/10/a_logo-1.gif"
            alt="Actelis" style={{height:38,objectFit:"contain",display:"block"}} />
          <div style={{borderLeft:"1px solid #1E3A5F",paddingLeft:16}}>
            <div style={{color:"white",fontWeight:700,fontSize:15,lineHeight:1.2}}>Price Quote Tool</div>
            <div style={{color:"#475569",fontSize:10,marginTop:1}}>Price list v{pricesMeta.version} · {pricesMeta.updated}</div>
            <div style={{padding:"2px 8px",borderRadius:4,background:(SC[stat]||"#888")+"33",color:SC[stat]||"#888",fontSize:15,fontWeight:700,border:`1px solid ${(SC[stat]||"#888")}55`,display:"inline-block",marginTop:2}}>{stat}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["📥 Import PDF",false],["⬇ Excel",false],["🔗 HubSpot",false]].map(([l,p])=>(
            <button key={l} style={{padding:"6px 13px",borderRadius:5,fontSize:14,fontWeight:700,cursor:"pointer",background:p?A:"#1E3A5F",color:p?"white":"#94A3B8",border:"none"}}>{l}</button>
          ))}
          <button onClick={()=>setShowAdmin(true)}
            style={{padding:"6px 13px",borderRadius:5,fontSize:14,fontWeight:700,cursor:"pointer",
              background:"#1E3A5F",color:"#94A3B8",border:"none"}}>
            ⚙ Admin
          </button>
          <button onClick={exportPdf} disabled={exporting}
            style={{padding:"6px 16px",borderRadius:5,fontSize:14,fontWeight:700,cursor:exporting?"wait":"pointer",
              background:exporting?"#92400E":"#D97706",color:"white",border:"none",opacity:exporting?0.8:1,
              display:"flex",alignItems:"center",gap:4}}>
            {exporting ? "⏳ Generating..." : "⬇ Export PDF"}
          </button>
        </div>
      </div>

      <div style={{maxWidth:1260,margin:"0 auto",padding:"16px 14px",display:"grid",gridTemplateColumns:"1fr 285px",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* QUOTE DETAILS */}
          <Panel title="Quote Details" icon="📋">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px 12px"}}>
              {[
                ["Quotation #",<input style={{...inp,fontFamily:"monospace"}} value={qn} onChange={e=>setQn(e.target.value)} placeholder="e.g. ACT-2024-001"/>,"*"],
                ["Status",<select style={inp} value={stat} onChange={e=>setStat(e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>,""],
                ["Quoted By",<input style={inp} value={qby} onChange={e=>setQby(e.target.value)} placeholder="Your name"/>,""],
                ["Customer Name",<input style={inp} value={cust} onChange={e=>setCust(e.target.value)} placeholder="Company name"/>,"*"],
                ["Contact",<input style={inp} value={cont} onChange={e=>setCont(e.target.value)} placeholder="Contact name"/>,""],
                ["Customer Type",<select style={inp} value={ct} onChange={e=>setCt(e.target.value)}><option>Reseller</option><option>End Customer</option></select>,""],
                ["Quote Date",<input type="date" style={inp} value={dt} onChange={e=>{setDt(e.target.value);setExp(ADM(e.target.value,30));}}/>,""],
                ["Expiry Date",<input type="date" style={inp} value={exp} onChange={e=>setExp(e.target.value)}/>,""],
                ["Region",<select style={inp} value={reg.name} onChange={e=>setReg(REGIONS_MAIN.find(r=>r.name===e.target.value))}>{REGIONS_MAIN.map(r=><option key={r.name}>{r.name}</option>)}</select>,""],
                ["Payment Terms",<select style={inp} value={pay} onChange={e=>setPay(e.target.value)}>{PAYMENTS.map(t=><option key={t}>{t}</option>)}</select>,""],
                ["Shipping Terms",<select style={inp} value={ship} onChange={e=>setShip(e.target.value)}>{SHIPPINGS.map(t=><option key={t}>{t}</option>)}</select>,""],
                ["",(
                  <div style={{display:"flex",alignItems:"center",gap:7,marginTop:16}}>
                    <TogM v={dr} set={setDr}/>
                    <span style={{fontSize:15,color:dr?A:M,fontWeight:dr?600:400}}>
                      Deal Registration {dr&&isNA&&<span style={{color:"#059669",fontSize:10}}>+7% active</span>}
                    </span>
                  </div>
                ),""]
              ].map(([lb,el,rq],i)=>(
                <div key={i}>
                  {lb&&<div style={{fontSize:15,fontWeight:700,color:M,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{lb}{rq&&<span style={{color:"#EF4444",marginLeft:2}}>*</span>}</div>}
                  {el}
                </div>
              ))}
            </div>
            <div style={{marginTop:8}}>
              <div style={{fontSize:15,fontWeight:700,color:M,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Comments</div>
              <textarea value={cmts} onChange={e=>setCmts(e.target.value)} placeholder="Comments for the quote output..."
                style={{...inp,minHeight:44,resize:"vertical"}}/>
            </div>
          </Panel>

          {/* LINE ITEMS */}
          <Panel title="Line Items" icon="📦" actions={
            <div style={{display:"flex",gap:5}}>
              {[["hw","Hardware (A/B/C)"],["svc","Services (D)"]].map(([k,l])=>(
                <button key={k} onClick={()=>{setTab(k);setSrch("");}} style={{padding:"2px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,background:tab===k?N:"transparent",color:tab===k?"white":M}}>{l}</button>
              ))}
            </div>
          }>
            <div style={{position:"relative",marginBottom:8}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#94A3B8",fontSize:13}}>🔍</span>
              <input value={srch} onChange={e=>{setSrch(e.target.value);setDrop(true);}} onFocus={()=>setDrop(true)}
                placeholder="Search part #, description or category..." style={{...inp,paddingLeft:28,border:"1.5px solid #CBD5E1"}}/>
              {drop&&res.length>0&&(
                <div style={{position:"absolute",zIndex:200,top:"100%",left:0,right:0,background:"white",border:`1px solid ${B}`,borderRadius:7,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",maxHeight:300,overflowY:"auto",marginTop:2}}>
                  {res.map(p=>{
                    const d=getDiscMain(p.cat||"",reg.id,ct,dr,discounts);
                    return(
                      <div key={p.pn} onClick={()=>addItem(p)} style={{padding:"8px 12px",cursor:"pointer",borderBottom:`1px solid #F8FAFC`,display:"grid",gridTemplateColumns:"108px 1fr auto",gap:8,alignItems:"center"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                        <code style={{fontSize:14,color:N,fontWeight:700}}>{p.pn}</code>
                        <div>
                          <div style={{fontSize:15,color:T}}>{p.desc}</div>
                          <div style={{fontSize:15,color:"#94A3B8",marginTop:1}}>{p.cat}</div>
                        </div>
                        <div style={{textAlign:"right",whiteSpace:"nowrap"}}>
                          <div style={{fontSize:15,fontWeight:700,color:N}}>{p.price?$M(p.price):p.lpString?.substring(0,18)||"—"}</div>
                          {d>0&&p.price>0&&<div style={{fontSize:15,color:"#10B981"}}>-{PM(d)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {drop&&srch&&res.length===0&&(
                <div style={{position:"absolute",zIndex:200,top:"100%",left:0,right:0,background:"white",border:`1px solid ${B}`,borderRadius:7,padding:12,textAlign:"center",color:"#94A3B8",fontSize:15,marginTop:2}}>
                  No results for "{srch}"
                </div>
              )}
            </div>

            {lines.length===0?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#94A3B8"}}>
                <div style={{fontSize:26,marginBottom:5}}>📋</div>
                <div style={{fontSize:12}}>Search above to add products manually</div>
                <div style={{fontSize:14,marginTop:2}}>or click <strong>⚡ Node Configurator</strong> to auto-build a BOM</div>
              </div>
            ):(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"108px 1fr 62px 86px 80px 94px 22px",gap:5,padding:"4px 5px",background:"#F1F5F9",borderRadius:4,fontSize:15,fontWeight:700,color:M,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>
                  <span>Part #</span><span>Description</span><span>Qty</span><span>List</span><span>Disc%</span><span style={{textAlign:"right"}}>Customer $</span><span/>
                </div>
                {lines.map(l=>{
                  const def=getDiscMain(l.cat,reg.id,ct,dr,discounts),ov=Math.abs(l.discount-def)>0.001;
                  const cp=l.listPrice*l.qty*(1-l.discount);
                  return(
                    <div key={l.id} style={{display:"grid",gridTemplateColumns:"108px 1fr 62px 86px 80px 94px 22px",gap:5,padding:"6px 5px",borderBottom:`1px solid #F8FAFC`,alignItems:"center"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#FAFBFF"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <code style={{fontSize:15,color:N,fontWeight:700}}>{l.pn}</code>
                      <div>
                        <div style={{fontSize:14,color:T,lineHeight:1.3}}>{l.desc}</div>
                        <div style={{fontSize:14,color:"#94A3B8",marginTop:1}}>{l.site?<span style={{color:"#3B82F6",fontWeight:600}}>📍{l.site} · </span>:""}{l.cat}</div>
                      </div>
                      <input type="number" value={l.qty} min={1} onChange={e=>upd(l.id,"qty",Math.max(1,parseInt(e.target.value)||1))}
                        style={{width:"100%",padding:"2px 4px",border:`1px solid ${B}`,borderRadius:3,fontSize:14,textAlign:"center"}}/>
                      <span style={{fontSize:14,color:M,textAlign:"right"}}>{$M(l.listPrice)}</span>
                      <div style={{display:"flex",alignItems:"center",gap:2}}>
                        <input type="number" value={(l.discount*100).toFixed(1)} min={0} max={100} step={0.5}
                          onChange={e=>upd(l.id,"discount",Math.min(1,Math.max(0,(parseFloat(e.target.value)||0)/100)))}
                          style={{width:40,padding:"2px 3px",border:`1px solid ${ov?"#D97706":B}`,borderRadius:3,fontSize:14,textAlign:"center",background:ov?"#FFFBEB":"white"}}/>
                        <span style={{fontSize:15,color:M}}>%</span>
                        {ov&&<span style={{fontSize:15,color:A}} title="Overridden">✎</span>}
                      </div>
                      <span style={{fontSize:15,fontWeight:700,color:N,textAlign:"right"}}>{$M(cp)}</span>
                      <button onClick={()=>rm(l.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#CBD5E1",fontSize:15,padding:0}}
                        onMouseEnter={e=>e.target.style.color="#EF4444"} onMouseLeave={e=>e.target.style.color="#CBD5E1"}>×</button>
                    </div>
                  );
                })}
                {Object.keys(cg).length>1&&(
                  <div style={{marginTop:6,borderTop:"1px dashed #E2E8F0",paddingTop:5}}>
                    {Object.entries(cg).map(([c,ls])=>{
                      const s=ls.reduce((x,l)=>x+l.listPrice*l.qty*(1-l.discount),0);
                      return<div key={c} style={{display:"flex",justifyContent:"space-between",padding:"1px 5px",fontSize:14,color:M}}>
                        <span>Type {c} subtotal</span><span style={{fontWeight:700}}>{$M(s)}</span>
                      </div>;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* WIZARD LAUNCHER — prominent */}
            <div onClick={()=>setShowWizard(true)} style={{marginTop:10,padding:"12px 16px",background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",border:"2px solid #D97706",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7,#FDE68A)"}
              onMouseLeave={e=>e.currentTarget.style.background="linear-gradient(135deg,#FFFBEB,#FEF3C7)"}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#92400E"}}>⚡ Node Configurator Wizard</div>
                <div style={{fontSize:14,color:"#B45309",marginTop:2}}>Auto-build complete BOM for PTP ML600 · PTMP GL800 · GL900 · GL9000 · ML230/ML2300</div>
              </div>
              <div style={{background:A,color:"white",padding:"5px 14px",borderRadius:6,fontSize:15,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
                Launch →
              </div>
            </div>
          </Panel>

          {/* FINANCIAL OPTIONS */}
          <Panel title="Financial Options" icon="⚙️">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <FlgM label="Add Shipping Cost" sub="~2% of hardware total" v={aShip} set={setAShip} amt={aShip?$M(shpA):null}/>
              <FlgM label="Add Credit Card Fee" sub="3% surcharge" v={aCC} set={setACC} amt={aCC?$M(ccA):null}/>
              {isNA&&<FlgM label="Sales Tax (NA only)" sub={
                <span style={{display:"flex",alignItems:"center",gap:3}}>
                  {aTax&&<><input type="number" value={tax} onChange={e=>setTax(parseFloat(e.target.value)||0)}
                    style={{width:34,padding:"1px 3px",border:`1px solid ${B}`,borderRadius:3,fontSize:10}}/><span style={{fontSize:10}}>%</span></>}
                  {!aTax&&"NA region only"}
                </span>} v={aTax} set={setATax} amt={aTax?$M(txA):null}/>}
              <FlgM label="Extended Warranty" sub="Included in quote output" v={false} set={()=>{}}/>
            </div>
          </Panel>
        </div>

        {/* SUMMARY PANEL */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:N,borderRadius:9,padding:16,color:"white",position:"sticky",top:14}}>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:"0.12em",color:"#475569",textTransform:"uppercase",marginBottom:12}}>Quote Summary</div>
            <div style={{fontSize:14,color:"#94A3B8",marginBottom:3}}>{cust||"—"} · {reg.name} · {ct}</div>
            {dr&&isNA&&<div style={{fontSize:15,background:"#1C3A1C",color:"#6EE7B7",padding:"2px 7px",borderRadius:3,display:"inline-block",marginBottom:6}}>✓ Deal Registration Active</div>}
            <div style={{borderTop:"1px solid #1E3A5F",paddingTop:8,marginTop:6}}>
              <SRM l="Line items" v={lines.length} plain/>
              <SRM l="List total" v={$M(lstT)} muted/>
              {lstT>0&&<SRM l="Discount" v={`-${$M(lstT-hwT)} (${PM((lstT-hwT)/lstT)})`} green/>}
              <SRM l="Hardware subtotal" v={$M(hwT)}/>
              {aShip&&<SRM l="Shipping" v={$M(shpA)} muted/>}
              {aCC&&<SRM l="CC Fee" v={$M(ccA)} muted/>}
              {aTax&&isNA&&<SRM l={`Tax (${tax}%)`} v={$M(txA)} muted/>}
            </div>
            <div style={{borderTop:"1px solid #1E3A5F",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:15,color:"#94A3B8",fontWeight:600}}>Grand Total</span>
              <span style={{fontSize:22,fontWeight:800,color:A}}>{$M(grand)}</span>
            </div>
            {lines.length>0&&(
              <div style={{marginTop:12}}>
                <div style={{fontSize:15,fontWeight:800,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>By Category</div>
                {Object.entries(cg).map(([c,ls])=>{
                  const s=ls.reduce((x,l)=>x+l.listPrice*l.qty*(1-l.discount),0),p=grand>0?s/grand:0;
                  return<div key={c} style={{marginBottom:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:2}}>
                      <span style={{color:"#94A3B8"}}>Type {c}</span>
                      <span style={{color:"white",fontWeight:600}}>{$M(s)}</span>
                    </div>
                    <div style={{height:2,background:"#1E3A5F",borderRadius:1}}>
                      <div style={{height:2,background:A,borderRadius:1,width:`${p*100}%`,transition:"width 0.3s"}}/>
                    </div>
                  </div>;
                })}
              </div>
            )}
            <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={exportPdf} disabled={exporting} style={{width:"100%",padding:8,background:A,color:"white",border:"none",borderRadius:5,fontSize:15,fontWeight:700,cursor:exporting?"wait":"pointer",opacity:exporting?0.7:1}}>{exporting?"⏳ Generating...":"⬇ Export PDF"}</button>
              <button style={{width:"100%",padding:8,background:"transparent",color:"#94A3B8",border:"1px solid #1E3A5F",borderRadius:5,fontSize:15,fontWeight:600,cursor:"pointer"}}>⬇ Export Excel</button>
            </div>
          </div>
          <div style={{background:"white",borderRadius:7,padding:12,border:`1px solid ${B}`,fontSize:10}}>
            <div style={{fontWeight:700,color:T,marginBottom:7,fontSize:13}}>Quote Info</div>
            {[["Date",dt],["Expires",exp],["Payment",pay],["Shipping",ship]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:"#94A3B8"}}>{k}</span>
                <span style={{color:T,fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {drop&&<div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setDrop(false)}/>}
    </div>
  );
}

function Panel({title,icon,children,actions}){
  return(
    <div style={{background:"white",borderRadius:8,border:"1px solid #E2E8F0",overflow:"hidden"}}>
      <div style={{padding:"9px 12px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span>{icon}</span><span style={{fontWeight:700,fontSize:14,color:"#1A2035"}}>{title}</span></div>
        {actions}
      </div>
      <div style={{padding:12}}>{children}</div>
    </div>
  );
}
function TogM({v,set}){
  return<div onClick={()=>set(!v)} style={{width:32,height:17,borderRadius:8,background:v?"#D97706":"#CBD5E1",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:13,height:13,borderRadius:"50%",background:"white",position:"absolute",top:2,left:v?17:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
  </div>;
}
function FlgM({label,sub,v,set,amt}){
  return<div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",background:v?"#F0FDF4":"#F8FAFC",borderRadius:6,border:`1px solid ${v?"#86EFAC":"#E2E8F0"}`}}>
    <TogM v={v} set={set}/>
    <div style={{flex:1}}>
      <div style={{fontSize:15,fontWeight:v?600:400,color:v?"#166534":"#374151"}}>{label}</div>
      <div style={{fontSize:15,color:"#94A3B8"}}>{sub}</div>
    </div>
    {amt&&<span style={{fontSize:15,fontWeight:700,color:"#059669"}}>{amt}</span>}
  </div>;
}
function SRM({l,v,muted,green,plain}){
  return<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
    <span style={{fontSize:14,color:muted?"#475569":"#94A3B8"}}>{l}</span>
    <span style={{fontSize:15,fontWeight:plain?400:600,color:green?"#10B981":muted?"#64748B":"white"}}>{v}</span>
  </div>;
}
