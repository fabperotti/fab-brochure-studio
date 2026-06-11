"use client";
import { useState, useCallback, useRef } from "react";
import { generatePDF } from "./pdfgen.js";

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

// ── pdf-lib loader ──
async function loadPdfLibIfNeeded() {
  if (window.PDFLib) return window.PDFLib;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
    s.onload = () => resolve(window.PDFLib);
    s.onerror = () => reject(new Error("Cannot load pdf-lib"));
    document.head.appendChild(s);
  });
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
  );
}
