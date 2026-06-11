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

async function generatePDF(propertyData, photos, logoFile, agencyName, targetLang) {
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