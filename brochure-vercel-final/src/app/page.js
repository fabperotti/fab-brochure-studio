"use client";
import { useState, useCallback, useRef } from "react";

const LANGUAGES = [
  { code: "en", label: "English 🇬🇧" },
  { code: "pt", label: "Português 🇵🇹" },
  { code: "fr", label: "Français 🇫🇷" },
  { code: "de", label: "Deutsch 🇩🇪" },
  { code: "es", label: "Español 🇪🇸" },
  { code: "zh", label: "中文 🇨🇳" },
  { code: "ar", label: "العربية 🇦🇪" },
  { code: "ru", label: "Русский 🇷🇺" },
  { code: "nl", label: "Nederlands 🇳🇱" },
  { code: "sv", label: "Svenska 🇸🇪" },
];

// ── PDF.js extraction ──
async function loadPdfjs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    s.onerror = () => reject(new Error("Cannot load PDF.js"));
    document.head.appendChild(s);
  });
}

async function extractPdfText(file) {
  const lib = await loadPdfjs();
  const ab = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: new Uint8Array(ab) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n\n";
  }
  return text.trim();
}

// ── Upload Zone ──
function UploadZone({ accept, onFiles, multiple = false, children }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    onFiles(Array.from(e.dataTransfer.files));
  }, [onFiles]);
  return (
    <div
      style={{
        border: `1.5px dashed ${drag ? "#c8a96e" : "#d4cfc8"}`,
        borderRadius: 8, padding: "28px 20px", textAlign: "center",
        cursor: "pointer", background: drag ? "#fdf9f3" : "#fafaf9",
        transition: "all 0.2s",
      }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => ref.current.click()}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple}
        style={{ display: "none" }} onChange={(e) => onFiles(Array.from(e.target.files))} />
      {children}
    </div>
  );
}

// ── Styles ──
const S = {
  app: { minHeight: "100vh", background: "#f5f3f0", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1a1a1a" },
  header: { borderBottom: "1px solid #e8e4de", padding: "20px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 10 },
  logoMark: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { width: 32, height: 32, background: "#0e0e12", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 },
  appName: { fontSize: 15, fontWeight: 600, color: "#0e0e12", letterSpacing: "0.3px" },
  appSub: { fontSize: 10, color: "#9a8f7e", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 },
  main: { maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" },
  hero: { marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid #e8e4de" },
  heroTitle: { fontSize: 32, fontWeight: 300, color: "#0e0e12", marginBottom: 10, lineHeight: 1.2, letterSpacing: "-0.3px" },
  heroAccent: { fontWeight: 600, color: "#c8a96e" },
  heroSub: { fontSize: 14, color: "#7a7060", lineHeight: 1.7, maxWidth: 460 },
  card: { background: "#fff", border: "1px solid #e8e4de", borderRadius: 12, padding: "28px", marginBottom: 16 },
  sectionLabel: { fontSize: 9, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#c8a96e", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 },
  sectionLine: { flex: 1, height: "1px", background: "#e8e4de" },
  fieldLabel: { fontSize: 11.5, color: "#7a7060", fontWeight: 500, marginBottom: 7 },
  input: { width: "100%", border: "1px solid #e0dbd4", borderRadius: 7, padding: "10px 13px", fontSize: 13.5, color: "#1a1a1a", outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" },
  select: { width: "100%", border: "1px solid #e0dbd4", borderRadius: 7, padding: "10px 13px", fontSize: 13.5, color: "#1a1a1a", outline: "none", fontFamily: "inherit", background: "#fff", appearance: "none", cursor: "pointer" },
  textarea: { width: "100%", border: "1px solid #e0dbd4", borderRadius: 7, padding: "10px 13px", fontSize: 13.5, color: "#1a1a1a", outline: "none", fontFamily: "inherit", background: "#fff", resize: "vertical", minHeight: 80, lineHeight: 1.6, boxSizing: "border-box" },
  fileRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fafaf9", border: "1px solid #e8e4de", borderRadius: 8 },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))", gap: 8, marginTop: 14 },
  photoThumb: { aspectRatio: "1", borderRadius: 6, overflow: "hidden", position: "relative", border: "1px solid #e8e4de" },
  btnOutline: { background: "#fff", border: "1px solid #c8a96e", borderRadius: 7, padding: "9px 16px", color: "#c8a96e", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" },
  genBtn: { width: "100%", padding: 16, background: "#0e0e12", border: "none", borderRadius: 10, color: "#fff", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 8, letterSpacing: "0.3px" },
  genBtnOff: { width: "100%", padding: 16, background: "#e8e4de", border: "none", borderRadius: 10, color: "#a09890", fontSize: 14.5, fontWeight: 600, cursor: "not-allowed", fontFamily: "inherit", marginTop: 8 },
  progressCard: { background: "#fff", border: "1px solid #e8e4de", borderRadius: 12, padding: "40px 36px", textAlign: "center", marginBottom: 16 },
  successCard: { background: "#fff", border: "1px solid #c8e8c8", borderRadius: 12, padding: "40px 36px", textAlign: "center", marginBottom: 16 },
  errorBox: { background: "#fff8f8", border: "1px solid #e8c8c8", borderRadius: 8, padding: "14px 18px", marginBottom: 12, fontSize: 13, color: "#a04040", lineHeight: 1.6 },
};

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [agencyName, setAgencyName] = useState("");
  const [agencyNotes, setAgencyNotes] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [status, setStatus] = useState("idle");
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState("");
  const [error, setError] = useState("");
  const logoRef = useRef();

  const isReady = pdfFile && photos.length > 0;

  const pushStep = (text, done = false) =>
    setSteps((prev) => {
      const updated = prev.map((s, i) => i === prev.length - 1 ? { ...s, done: true } : s);
      return [...updated, { text, done }];
    });

  const handleGenerate = async () => {
    if (!isReady) return;
    setStatus("generating"); setSteps([]); setProgress(5); setError(""); setDownloadUrl(null);
    try {
      // Step 1: extract PDF text
      pushStep("Lettura PDF in corso…");
      setProgress(12);
      const pdfText = await extractPdfText(pdfFile);
      if (!pdfText || pdfText.length < 20) throw new Error("Testo non trovato. Il PDF potrebbe essere scansionato.");

      // Step 2: translate with Claude
      pushStep("Claude AI: traduzione e riscrittura in chiave luxury…");
      setProgress(35);
      const langLabel = LANGUAGES.find(l => l.code === targetLang)?.label || "English";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ italianText: pdfText, targetLang, langLabel, agencyNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore traduzione");
      const propertyData = data.propertyData;

      // Step 3: generate PDF client-side
      pushStep("Generazione PDF con layout professionale…");
      setProgress(70);

      const pdfBytes = await generatePDF(propertyData, photos, logoFile, agencyName, targetLang);

      setProgress(100);
      setSteps(prev => prev.map(s => ({ ...s, done: true })));

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fname = `brochure_${(propertyData.title || "property").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${targetLang}.pdf`;
      setDownloadUrl(url);
      setDownloadName(fname);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Errore sconosciuto.");
      setStatus("error");
    }
  };

  const addPhotos = (files) => {
    const imgs = files.filter(f => f.type.startsWith("image/"));
    setPhotos(p => [...p, ...imgs]);
    setPhotoUrls(u => [...u, ...imgs.map(f => URL.createObjectURL(f))]);
  };

  const removePhoto = (i) => {
    URL.revokeObjectURL(photoUrls[i]);
    setPhotos(p => p.filter((_, j) => j !== i));
    setPhotoUrls(u => u.filter((_, j) => j !== i));
  };

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logoMark}>
          <div style={S.logoIcon}>🏛</div>
          <div>
            <div style={S.appName}>Brochure Studio</div>
            <div style={S.appSub}>Luxury Real Estate</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#9a8f7e", letterSpacing: "0.3px" }}>Powered by Claude AI</div>
      </div>

      <div style={S.main}>
        {/* Hero */}
        <div style={S.hero}>
          <h1 style={S.heroTitle}>Da scheda italiana a<br/><span style={S.heroAccent}>brochure di lusso</span> in 30 secondi</h1>
          <p style={S.heroSub}>Carica il PDF ricevuto dal partner italiano, aggiungi le foto, scegli la lingua — Claude traduce e genera un PDF professionale pronto da inviare.</p>
        </div>

        {(status === "idle" || status === "error") && (<>

          {/* Agency */}
          <div style={S.card}>
            <div style={S.sectionLabel}><span>La tua agenzia</span><div style={S.sectionLine}/></div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 18 }}>
              <div style={{ width: 72, height: 72, border: "1px solid #e8e4de", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#fafaf9", flexShrink: 0 }}>
                {logoUrl ? <img src={logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8, boxSizing: "border-box" }} alt="logo"/> : <span style={{ fontSize: 24, opacity: 0.2 }}>🏢</span>}
              </div>
              <div>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoUrl(URL.createObjectURL(f)); } }}/>
                <button style={S.btnOutline} onClick={() => logoRef.current.click()}>{logoFile ? "Cambia logo" : "Carica logo"}</button>
                <div style={{ fontSize: 11, color: "#a09880", marginTop: 6 }}>PNG trasparente consigliato</div>
              </div>
            </div>
            <div style={S.fieldLabel}>Nome agenzia</div>
            <input style={S.input} type="text" placeholder="es. Groupe Mackay Prestige" value={agencyName} onChange={e => setAgencyName(e.target.value)}/>
          </div>

          {/* Property */}
          <div style={S.card}>
            <div style={S.sectionLabel}><span>Proprietà</span><div style={S.sectionLine}/></div>

            <div style={{ marginBottom: 20 }}>
              <div style={S.fieldLabel}>Scheda PDF italiana <span style={{ color: "#c8a96e" }}>*</span></div>
              {!pdfFile
                ? <UploadZone accept="application/pdf" onFiles={f => setPdfFile(f[0])}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                    <div style={{ fontSize: 13, color: "#c8a96e", fontWeight: 600, marginBottom: 4 }}>Trascina il PDF o clicca</div>
                    <div style={{ fontSize: 11.5, color: "#9a8f7e" }}>Scheda ricevuta dal partner italiano</div>
                  </UploadZone>
                : <div style={S.fileRow}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{pdfFile.name}</span>
                    <span style={{ fontSize: 11, color: "#9a8f7e" }}>{(pdfFile.size/1024).toFixed(0)} KB</span>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9a8f7e" }} onClick={() => setPdfFile(null)}>✕</button>
                  </div>}
            </div>

            <div>
              <div style={S.fieldLabel}>Foto <span style={{ color: "#c8a96e" }}>*</span> <span style={{ fontWeight: 400, color: "#a09880" }}>· prima foto = copertina · max 40</span></div>
              {photos.length === 0
                ? <UploadZone accept="image/*" multiple onFiles={addPhotos}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖼</div>
                    <div style={{ fontSize: 13, color: "#c8a96e", fontWeight: 600, marginBottom: 4 }}>Trascina le foto o clicca</div>
                    <div style={{ fontSize: 11.5, color: "#9a8f7e" }}>JPG, PNG · selezione multipla</div>
                  </UploadZone>
                : <div>
                    <div style={S.photoGrid}>
                      {photoUrls.map((url, i) => (
                        <div key={i} style={S.photoThumb}>
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                          {i === 0 && <div style={{ position: "absolute", bottom: 3, left: 3, background: "#c8a96e", color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>COVER</div>}
                          <button style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 18, height: 18, color: "#fff", cursor: "pointer", fontSize: 10 }} onClick={() => removePhoto(i)}>✕</button>
                        </div>
                      ))}
                      {photos.length < 40 && (
                        <UploadZone accept="image/*" multiple onFiles={addPhotos}>
                          <div style={{ fontSize: 20, opacity: 0.3, lineHeight: "80px" }}>+</div>
                        </UploadZone>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#a09880", marginTop: 8 }}>{photos.length} foto · {Math.ceil(photos.length / 2) + 2} pagine totali</div>
                  </div>}
            </div>
          </div>

          {/* Options */}
          <div style={S.card}>
            <div style={S.sectionLabel}><span>Opzioni</span><div style={S.sectionLine}/></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={S.fieldLabel}>Lingua</div>
                <select style={S.select} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div style={S.fieldLabel}>Note di stile per Claude (opzionale)</div>
            <textarea style={S.textarea} placeholder="es. Tono elegante, enfatizza il lifestyle e la privacy, target acquirenti alto profilo…" value={agencyNotes} onChange={e => setAgencyNotes(e.target.value)}/>
          </div>

          {status === "error" && <div style={S.errorBox}>⚠️ {error}</div>}

          <div style={{ fontSize: 12, color: "#9a8f7e", marginBottom: 6, lineHeight: 1.6, padding: "12px 16px", background: "#fff", borderRadius: 8, border: "1px solid #e8e4de" }}>
            <span style={{ color: "#c8a96e", fontWeight: 600 }}>Output:</span> PDF professionale · copertina full-bleed · pagina descrizione + caratteristiche · {photos.length > 1 ? `${Math.ceil((photos.length-1)/2)} pagine galleria (2 foto per pagina)` : "galleria fotografica"}
          </div>

          <button style={isReady ? S.genBtn : S.genBtnOff} disabled={!isReady} onClick={handleGenerate}>
            {isReady ? "Genera Brochure PDF" : "Carica PDF e almeno una foto per continuare"}
          </button>
        </>)}

        {/* Progress */}
        {status === "generating" && (
          <div style={S.progressCard}>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#0e0e12", marginBottom: 6 }}>Generazione in corso…</div>
            <div style={{ fontSize: 13, color: "#9a8f7e", marginBottom: 28 }}>Claude sta elaborando la proprietà</div>
            <div style={{ background: "#f0ede8", borderRadius: 999, height: 3, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ height: "100%", borderRadius: 999, background: "#c8a96e", width: `${progress}%`, transition: "width 0.4s ease" }}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", maxWidth: 380, margin: "0 auto" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.done ? "#5a9a5a" : "#c8a96e", flexShrink: 0 }}/>
                  <span style={{ color: s.done ? "#9a8f7e" : "#0e0e12" }}>{s.text}</span>
                  <span style={{ marginLeft: "auto" }}>{s.done ? "✓" : "⏳"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {status === "done" && (
          <div style={S.successCard}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "#2a6a2a", marginBottom: 6 }}>Brochure pronta!</div>
            <div style={{ fontSize: 13, color: "#7a8f7a", marginBottom: 28 }}>
              {LANGUAGES.find(l => l.code === targetLang)?.label} · {photos.length} foto · {Math.ceil((photos.length-1)/2) + 2} pagine
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={downloadUrl} download={downloadName} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "#0e0e12", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                ⬇ Scarica PDF
              </a>
              <button onClick={() => { setStatus("idle"); setSteps([]); setProgress(0); if (downloadUrl) URL.revokeObjectURL(downloadUrl); setDownloadUrl(null); }}
                style={{ padding: "13px 26px", background: "#fff", border: "1px solid #e8e4de", borderRadius: 9, color: "#7a7060", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                ↺ Nuova proprietà
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}async function generatePDF(propertyData, photos, logoFile, agencyName, targetLang) {
  const PDFLib = await loadPdfLibIfNeeded();
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  const W = 595, H = 842;
  const GOLD    = rgb(0.78, 0.66, 0.43);
  const DARK    = rgb(0.05, 0.05, 0.08);
  const WHITE   = rgb(1, 1, 1);
  const CREAM   = rgb(0.98, 0.97, 0.95);
  const CHARCOAL = rgb(0.13, 0.12, 0.10);
  const MUTED   = rgb(0.58, 0.55, 0.50);

  // Translated labels
  const LABELS = {
    features:    { en:"KEY FEATURES", pt:"CARACTERÍSTICAS", fr:"CARACTÉRISTIQUES", de:"AUSSTATTUNG", es:"CARACTERÍSTICAS", zh:"特点", ar:"المميزات", ru:"ОСОБЕННОСТИ", nl:"KENMERKEN", sv:"EGENSKAPER" },
    description: { en:"DESCRIPTION",  pt:"DESCRIÇÃO",       fr:"DESCRIPTION",      de:"BESCHREIBUNG",es:"DESCRIPCIÓN",    zh:"描述", ar:"الوصف",   ru:"ОПИСАНИЕ",    nl:"BESCHRIJVING",sv:"BESKRIVNING" },
    gallery:     { en:"PHOTO GALLERY",pt:"GALERIA",         fr:"GALERIE PHOTOS",   de:"FOTOGALERIE", es:"GALERÍA",        zh:"照片库",ar:"معرض",    ru:"ГАЛЕРЕЯ",     nl:"GALERIJ",     sv:"GALLERI" },
    surface:     { en:"AREA",         pt:"ÁREA",            fr:"SUPERFICIE",       de:"FLÄCHE",      es:"SUPERFICIE",     zh:"面积", ar:"مساحة",   ru:"ПЛОЩАДЬ",     nl:"OPPERVLAK",   sv:"YTA" },
    rooms:       { en:"ROOMS",        pt:"DIVISÕES",        fr:"PIÈCES",           de:"ZIMMER",      es:"HABITACIONES",   zh:"房间", ar:"غرف",     ru:"КОМНАТЫ",     nl:"KAMERS",      sv:"RUM" },
    location:    { en:"LOCATION",     pt:"LOCALIZAÇÃO",     fr:"EMPLACEMENT",      de:"LAGE",        es:"UBICACIÓN",      zh:"位置", ar:"موقع",    ru:"РАСПОЛОЖЕНИЕ",nl:"LOCATIE",     sv:"LÄGE" },
    confidential:{ en:"CONFIDENTIAL · FOR QUALIFIED BUYERS ONLY", pt:"CONFIDENCIAL · APENAS PARA COMPRADORES QUALIFICADOS", fr:"CONFIDENTIEL · POUR ACHETEURS QUALIFIÉS", de:"VERTRAULICH · NUR FÜR QUALIFIZIERTE KÄUFER", es:"CONFIDENCIAL · SOLO PARA COMPRADORES CALIFICADOS", zh:"机密·仅供合格买家", ar:"سري·للمشترين المؤهلين", ru:"КОНФИДЕНЦИАЛЬНО", nl:"VERTROUWELIJK", sv:"KONFIDENTIELLT" },
  };
  const lang = (targetLang || "en").toLowerCase();
  const L = (key) => (LABELS[key] && (LABELS[key][lang] || LABELS[key]["en"])) || key;

  // Helpers
  function wrap(text, maxChars) {
    const words = (text || "").split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (test.length <= maxChars) { cur = test; }
      else { if (cur) lines.push(cur); cur = w.length > maxChars ? w.substring(0, maxChars) : w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function trunc(str, max) {
    if (!str) return "";
    return str.length > max ? str.substring(0, max - 1) + "…" : str;
  }

  async function fileToBytes(file) {
    const ab = await file.arrayBuffer();
    return new Uint8Array(ab);
  }

  function drawFooter(page, fontR, pageNum, totalPages, confidentialLabel) {
    page.drawRectangle({ x: 0, y: 0, width: W, height: 24, color: DARK });
    page.drawText(trunc(confidentialLabel, 72), { x: 36, y: 8, size: 5.5, font: fontR, color: MUTED });
    page.drawText(`${pageNum} / ${totalPages}`, { x: W - 44, y: 8, size: 6.5, font: fontR, color: MUTED });
  }

  const pdfDoc = await PDFDocument.create();
  const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontI = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Embed logo
  let logoImg = null;
  if (logoFile) {
    try {
      const bytes = await fileToBytes(logoFile);
      const isJpeg = logoFile.type === "image/jpeg" || /\.jpe?g$/i.test(logoFile.name);
      logoImg = isJpeg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
    } catch (_) {}
  }

  // Embed photos
  const embPhotos = [];
  for (const photo of photos.slice(0, 40)) {
    try {
      const bytes = await fileToBytes(photo);
      const isJpeg = photo.type === "image/jpeg" || /\.jpe?g$/i.test(photo.name);
      const img = isJpeg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
      embPhotos.push(img);
    } catch (_) {}
  }

  const galleryPhotos = embPhotos.slice(1);
  const gallPages = galleryPhotos.length > 0 ? Math.ceil(galleryPhotos.length / 2) : 0;
  const totalPages = 2 + gallPages;
  const confidential = L("confidential");

  // ════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════
  const p1 = pdfDoc.addPage([W, H]);
  p1.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });

  // Cover photo — top 65%
  const coverPhotoH = Math.round(H * 0.65);
  if (embPhotos[0]) {
    const img = embPhotos[0];
    const scaleW = W / img.width;
    const scaledH = img.height * scaleW;
    if (scaledH >= coverPhotoH) {
      p1.drawImage(img, { x: 0, y: H - scaledH, width: W, height: scaledH });
    } else {
      const scaleH = coverPhotoH / img.height;
      const scaledW = img.width * scaleH;
      p1.drawImage(img, { x: (W - scaledW) / 2, y: H - coverPhotoH, width: scaledW, height: coverPhotoH });
    }
  } else {
    p1.drawRectangle({ x: 0, y: H - coverPhotoH, width: W, height: coverPhotoH, color: rgb(0.15, 0.20, 0.25) });
  }

  // Dark bottom panel
  const panelH = H - coverPhotoH;
  p1.drawRectangle({ x: 0, y: 0, width: W, height: panelH, color: DARK });

  // Gold rule
  p1.drawRectangle({ x: 36, y: panelH - 16, width: 36, height: 1.5, color: GOLD });

  // Title
  const titleLines = wrap((propertyData.title || "Exclusive Property").toUpperCase(), 34);
  let ty = panelH - 38;
  for (const line of titleLines.slice(0, 3)) {
    p1.drawText(line, { x: 36, y: ty, size: 17, font: fontB, color: WHITE });
    ty -= 22;
  }

  // Tagline
  if (propertyData.tagline) {
    p1.drawText(trunc(propertyData.tagline, 65), { x: 36, y: ty - 2, size: 10, font: fontI, color: GOLD });
    ty -= 18;
  }
  ty -= 8;

  // Separator
  p1.drawRectangle({ x: 36, y: ty, width: W - 72, height: 0.5, color: GOLD, opacity: 0.3 });
  ty -= 18;

  // Stats — 3 columns strictly within bounds
  const colW = Math.floor((W - 72) / 3);
  const statsData = [
    propertyData.surface && { v: trunc(propertyData.surface, 16), l: L("surface") },
    propertyData.rooms   && { v: trunc(propertyData.rooms, 16),   l: L("rooms") },
    propertyData.location && { v: trunc(propertyData.location, 16), l: L("location") },
  ].filter(Boolean);

  statsData.slice(0, 3).forEach((st, i) => {
    const sx = 36 + i * colW;
    p1.drawText(st.v, { x: sx, y: ty, size: 11, font: fontB, color: WHITE, maxWidth: colW - 10 });
    p1.drawText(st.l, { x: sx, y: ty - 14, size: 6.5, font: fontR, color: MUTED });
  });
  ty -= 34;

  // Price
  if (propertyData.price) {
    p1.drawRectangle({ x: 36, y: ty + 4, width: W - 72, height: 0.5, color: GOLD, opacity: 0.25 });
    p1.drawText(trunc(propertyData.price, 28), { x: 36, y: ty - 14, size: 14, font: fontB, color: GOLD });
  }

  // Logo top-right corner
  if (logoImg) {
    const ld = logoImg.scaleToFit(72, 32);
    p1.drawImage(logoImg, { x: W - ld.width - 20, y: H - ld.height - 14, width: ld.width, height: ld.height });
  } else if (agencyName) {
    p1.drawText(trunc(agencyName, 22).toUpperCase(), { x: W - 180, y: H - 24, size: 8, font: fontB, color: WHITE });
  }

  drawFooter(p1, fontR, 1, totalPages, confidential);

  // ════════════════════════════════════════════════════
  // PAGE 2 — DESCRIPTION + FEATURES
  // ════════════════════════════════════════════════════
  const p2 = pdfDoc.addPage([W, H]);
  p2.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });

  // Header
  p2.drawRectangle({ x: 0, y: H - 60, width: W, height: 60, color: DARK });
  if (logoImg) {
    const ld = logoImg.scaleToFit(66, 34);
    p2.drawImage(logoImg, { x: 36, y: H - 50, width: ld.width, height: ld.height });
  } else if (agencyName) {
    p2.drawText(trunc(agencyName, 26).toUpperCase(), { x: 36, y: H - 38, size: 9, font: fontB, color: GOLD });
  }
  p2.drawText("LUXURY REAL ESTATE", { x: W - 155, y: H - 38, size: 7, font: fontR, color: MUTED });

  const MARGIN = 40;
  const CW = W - MARGIN * 2;
  let curY = H - 84;

  // Description
  p2.drawRectangle({ x: MARGIN, y: curY, width: 28, height: 1.5, color: GOLD });
  curY -= 18;
  p2.drawText(L("description"), { x: MARGIN, y: curY, size: 8, font: fontB, color: MUTED });
  curY -= 18;
  for (const line of wrap(propertyData.description || "", 68).slice(0, 20)) {
    p2.drawText(line, { x: MARGIN, y: curY, size: 11, font: fontR, color: CHARCOAL });
    curY -= 16;
  }
  curY -= 18;

  // Separator + Features
  p2.drawRectangle({ x: MARGIN, y: curY + 8, width: CW, height: 0.5, color: GOLD, opacity: 0.3 });
  p2.drawRectangle({ x: MARGIN, y: curY - 4, width: 28, height: 1.5, color: GOLD });
  curY -= 22;
  p2.drawText(L("features"), { x: MARGIN, y: curY, size: 8, font: fontB, color: MUTED });
  curY -= 22;

  const features = propertyData.features || [];
  const half = Math.ceil(features.length / 2);
  const col2X = MARGIN + Math.floor(CW / 2) + 8;
  const colMaxW = Math.floor(CW / 2) - 18;
  let fy1 = curY, fy2 = curY;

  features.slice(0, half).slice(0, 10).forEach(f => {
    p2.drawRectangle({ x: MARGIN, y: fy1 + 4, width: 4, height: 4, color: GOLD });
    p2.drawText(trunc(f, 36), { x: MARGIN + 10, y: fy1, size: 10, font: fontR, color: CHARCOAL, maxWidth: colMaxW });
    fy1 -= 18;
  });
  features.slice(half).slice(0, 10).forEach(f => {
    p2.drawRectangle({ x: col2X, y: fy2 + 4, width: 4, height: 4, color: GOLD });
    p2.drawText(trunc(f, 36), { x: col2X + 10, y: fy2, size: 10, font: fontR, color: CHARCOAL, maxWidth: colMaxW });
    fy2 -= 18;
  });

  // Photo strip at bottom if space
  const lowestY = Math.min(fy1, fy2) - 16;
  if (lowestY > 60 && galleryPhotos.length > 0) {
    const stripH = Math.min(lowestY - 36, 120);
    const count = Math.min(galleryPhotos.length, 3);
    const stripW = (CW - (count - 1) * 8) / count;
    for (let i = 0; i < count; i++) {
      const img = galleryPhotos[i];
      const dims = img.scaleToFit(stripW, stripH);
      p2.drawImage(img, {
        x: MARGIN + i * (stripW + 8) + (stripW - dims.width) / 2,
        y: 30 + (stripH - dims.height) / 2,
        width: dims.width, height: dims.height,
      });
    }
  }

  drawFooter(p2, fontR, 2, totalPages, confidential);

  // ════════════════════════════════════════════════════
  // PAGES 3+ — 2 LARGE PHOTOS PER PAGE
  // ════════════════════════════════════════════════════
  for (let gi = 0; gi < galleryPhotos.length; gi += 2) {
    const gp = pdfDoc.addPage([W, H]);
    gp.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.06, 0.06, 0.08) });

    // Header
    gp.drawRectangle({ x: 0, y: H - 48, width: W, height: 48, color: rgb(0.04, 0.04, 0.06) });
    gp.drawRectangle({ x: 36, y: H - 47, width: 24, height: 1.5, color: GOLD });
    gp.drawText(L("gallery"), { x: 36, y: H - 34, size: 7.5, font: fontB, color: MUTED });
    gp.drawText(trunc((propertyData.title || "").toUpperCase(), 46), { x: 36, y: H - 20, size: 11, font: fontB, color: WHITE, maxWidth: W - 130 });
    if (logoImg) {
      const ld = logoImg.scaleToFit(52, 26);
      gp.drawImage(logoImg, { x: W - ld.width - 24, y: H - 40, width: ld.width, height: ld.height });
    }

    // 2 photos per page
    const pagePhotos = galleryPhotos.slice(gi, gi + 2);
    const hasTwo = pagePhotos.length === 2;
    const MX = 24, pTop = H - 56, pBot = 28, GAP = 10;
    const photoH = hasTwo ? Math.floor((pTop - pBot - GAP) / 2) : pTop - pBot;
    const photoW = W - MX * 2;

    pagePhotos.forEach((img, idx) => {
      const py = hasTwo ? (idx === 0 ? pTop - photoH : pBot + GAP) : pBot;
      const dims = img.scaleToFit(photoW, photoH);
      gp.drawImage(img, {
        x: MX + (photoW - dims.width) / 2,
        y: py + (photoH - dims.height) / 2,
        width: dims.width, height: dims.height,
      });
    });

    if (hasTwo) {
      gp.drawRectangle({ x: MX, y: pBot + GAP - 1, width: photoW, height: 0.5, color: GOLD, opacity: 0.15 });
    }

    drawFooter(gp, fontR, 3 + Math.floor(gi / 2), totalPages, confidential);
  }

  return await pdfDoc.save();
}


