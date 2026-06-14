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

// ── Email templates ──
const EMAIL_T = {
  en: { subject: (t) => `Exclusive Property: ${t}`, greeting: "Dear valued client,", intro: "We are pleased to present an exceptional property that matches your criteria:", attached: "Please find attached the full brochure with photos and details.", closing: "We would be delighted to arrange a viewing at your convenience.", regards: "Best regards,", priceLabel: "Price", locationLabel: "Location" },
  pt: { subject: (t) => `Imóvel Exclusivo: ${t}`, greeting: "Caro(a) cliente,", intro: "Temos o prazer de lhe apresentar um imóvel excecional que corresponde aos seus critérios:", attached: "Em anexo encontrará a brochura completa com fotos e detalhes.", closing: "Ficaríamos muito satisfeitos em organizar uma visita à sua conveniência.", regards: "Com os melhores cumprimentos,", priceLabel: "Preço", locationLabel: "Localização" },
  fr: { subject: (t) => `Bien d'exception : ${t}`, greeting: "Cher client,", intro: "Nous avons le plaisir de vous présenter un bien exceptionnel correspondant à vos critères :", attached: "Vous trouverez ci-joint la brochure complète avec photos et détails.", closing: "Nous serions ravis d'organiser une visite à votre convenance.", regards: "Cordialement,", priceLabel: "Prix", locationLabel: "Emplacement" },
  de: { subject: (t) => `Exklusive Immobilie: ${t}`, greeting: "Sehr geehrte Damen und Herren,", intro: "Wir freuen uns, Ihnen eine außergewöhnliche Immobilie vorzustellen, die Ihren Kriterien entspricht:", attached: "Die vollständige Broschüre mit Fotos und Details finden Sie im Anhang.", closing: "Gerne vereinbaren wir einen Besichtigungstermin nach Ihren Wünschen.", regards: "Mit freundlichen Grüßen,", priceLabel: "Preis", locationLabel: "Lage" },
  es: { subject: (t) => `Propiedad Exclusiva: ${t}`, greeting: "Estimado/a cliente,", intro: "Nos complace presentarle una propiedad excepcional que coincide con sus criterios:", attached: "Encontrará adjunto el folleto completo con fotos y detalles.", closing: "Estaríamos encantados de organizar una visita cuando le convenga.", regards: "Un cordial saludo,", priceLabel: "Precio", locationLabel: "Ubicación" },
  zh: { subject: (t) => `独家房产：${t}`, greeting: "尊敬的客户，", intro: "我们很高兴向您介绍一处符合您要求的优质房产：", attached: "请查阅附件中包含照片和详细信息的完整宣传册。", closing: "我们将非常乐意根据您的方便安排实地参观。", regards: "祝好，", priceLabel: "价格", locationLabel: "位置" },
  ar: { subject: (t) => `عقار فاخر: ${t}`, greeting: "عميلنا الكريم،", intro: "يسعدنا أن نقدم لكم عقارًا استثنائيًا يتوافق مع متطلباتكم:", attached: "ستجدون في المرفقات الكتيب الكامل مع الصور والتفاصيل.", closing: "يسعدنا ترتيب زيارة في الوقت الذي يناسبكم.", regards: "مع أطيب التحيات،", priceLabel: "السعر", locationLabel: "الموقع" },
  ru: { subject: (t) => `Эксклюзивная недвижимость: ${t}`, greeting: "Уважаемый клиент,", intro: "Мы рады представить вам исключительный объект недвижимости, соответствующий вашим критериям:", attached: "Полная брошюра с фотографиями и подробностями во вложении.", closing: "Будем рады организовать просмотр в удобное для вас время.", regards: "С уважением,", priceLabel: "Цена", locationLabel: "Расположение" },
  nl: { subject: (t) => `Exclusief Vastgoed: ${t}`, greeting: "Geachte klant,", intro: "Wij stellen u graag een uitzonderlijke woning voor die aan uw criteria voldoet:", attached: "In de bijlage vindt u de volledige brochure met foto's en details.", closing: "Wij organiseren graag een bezichtiging op een tijdstip dat u schikt.", regards: "Met vriendelijke groet,", priceLabel: "Prijs", locationLabel: "Locatie" },
  sv: { subject: (t) => `Exklusiv Fastighet: ${t}`, greeting: "Bästa kund,", intro: "Vi har glädjen att presentera en exceptionell fastighet som matchar dina önskemål:", attached: "Den fullständiga broschyren med foton och detaljer bifogas.", closing: "Vi ser fram emot att ordna en visning när det passar dig.", regards: "Med vänliga hälsningar,", priceLabel: "Pris", locationLabel: "Läge" },
};

function cleanEmDash(str) {
  if (!str) return str;
  // Replace em-dash/en-dash surrounded by spaces with a comma — reads more naturally
  // and avoids the "—" character that looks AI-generated in plain-text emails.
  return str.replace(/\s+[—–]\s+/g, ", ").replace(/[—–]/g, ",");
}

function buildEmailText(propertyData, targetLang, agencyName) {
  const t = EMAIL_T[targetLang] || EMAIL_T.en;
  const title = cleanEmDash(propertyData.title || "");
  const tagline = cleanEmDash(propertyData.tagline || "");
  const description = cleanEmDash(propertyData.description || "");

  const paragraphs = [];
  paragraphs.push(t.greeting);
  paragraphs.push(t.intro);
  paragraphs.push(title);
  if (tagline) paragraphs.push(tagline);
  if (description) paragraphs.push(description);

  const details = [];
  if (propertyData.location) details.push(`${t.locationLabel}: ${cleanEmDash(propertyData.location)}`);
  if (propertyData.price) details.push(`${t.priceLabel}: ${propertyData.price}`);
  if (details.length) paragraphs.push(details.join("\n"));

  paragraphs.push(t.attached);
  paragraphs.push(t.closing);

  const signature = agencyName ? `${t.regards}\n${agencyName}` : t.regards;
  paragraphs.push(signature);

  return paragraphs.join("\n\n");
}

function buildEmailSubject(propertyData, targetLang) {
  const t = EMAIL_T[targetLang] || EMAIL_T.en;
  return t.subject(cleanEmDash(propertyData.title || ""));
}

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

  // Resize + re-encode an image file as JPEG via canvas, to keep PDF size manageable.
  // maxDim caps the longest side; quality is JPEG compression (0-1).
  async function compressImage(file, maxDim = 1600, quality = 0.8) {
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else { width = Math.round(width * (maxDim / height)); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      // Fill white background first — handles transparent PNGs converting to JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) return await fileToBytes(file); // fallback to original
      const ab = await blob.arrayBuffer();
      return new Uint8Array(ab);
    } catch (_) {
      return await fileToBytes(file); // fallback to original on any error
    }
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

  // Embed photos (resized + recompressed as JPEG to keep PDF size manageable)
  const embPhotos = [];
  for (const photo of photos.slice(0, 40)) {
    try {
      const bytes = await compressImage(photo);
      const img = await pdfDoc.embedJpg(bytes);
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

  // Cover photo — top 52%
  const coverPhotoH = Math.round(H * 0.52);
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
    const taglineLines = wrap(propertyData.tagline, 78).slice(0, 2);
    taglineLines.forEach((line) => {
      p1.drawText(line, { x: 36, y: ty - 2, size: 10, font: fontI, color: GOLD });
      ty -= 15;
    });
    ty -= 3;
  }
  ty -= 8;

  // Separator
  p1.drawRectangle({ x: 36, y: ty, width: W - 72, height: 0.5, color: GOLD, opacity: 0.3 });
  ty -= 18;

  // Stats — 3 columns strictly within bounds
  const colW = Math.floor((W - 72) / 3);
  const statsData = [
    propertyData.surface && { v: trunc(propertyData.surface, 56), l: L("surface") },
    propertyData.rooms   && { v: trunc(propertyData.rooms, 56),   l: L("rooms") },
    propertyData.location && { v: trunc(propertyData.location, 56), l: L("location") },
  ].filter(Boolean);

  const statColMaxChars = Math.max(6, Math.floor((colW - 10) / 6.5));
  const statsWrapped = statsData.slice(0, 3).map(st => wrap(st.v, statColMaxChars).slice(0, 2));
  const maxValLines = Math.max(1, ...statsWrapped.map(l => l.length));
  statsData.slice(0, 3).forEach((st, i) => {
    const sx = 36 + i * colW;
    const valLines = statsWrapped[i];
    valLines.forEach((line, li) => {
      p1.drawText(line, { x: sx, y: ty - li * 13, size: 11, font: fontB, color: WHITE, maxWidth: colW - 10 });
    });
    const labelY = ty - maxValLines * 13 - 2;
    p1.drawText(st.l, { x: sx, y: labelY, size: 6.5, font: fontR, color: MUTED });
  });
  ty -= maxValLines * 13 + 16;

  // Price
  if (propertyData.price) {
    p1.drawRectangle({ x: 36, y: ty + 4, width: W - 72, height: 0.5, color: GOLD, opacity: 0.25 });
    p1.drawText(trunc(propertyData.price, 28), { x: 36, y: ty - 14, size: 14, font: fontB, color: GOLD });
  }

  // Logo top-right corner
  if (logoImg) {
    const ld = logoImg.scaleToFit(140, 64);
    p1.drawImage(logoImg, { x: W - ld.width - 28, y: H - ld.height - 22, width: ld.width, height: ld.height });
  }
  if (agencyName) {
    if (logoImg) {
      // Show agency name in the dark panel, right-aligned, above the footer
      const nameText = trunc(agencyName, 30).toUpperCase();
      const nameWidth = fontB.widthOfTextAtSize(nameText, 8);
      p1.drawText(nameText, { x: W - 36 - nameWidth, y: 32, size: 8, font: fontB, color: GOLD });
    } else {
      p1.drawText(trunc(agencyName, 22).toUpperCase(), { x: W - 180, y: H - 24, size: 8, font: fontB, color: WHITE });
    }
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
    const ld = logoImg.scaleToFit(100, 46);
    p2.drawImage(logoImg, { x: 30, y: H - 53, width: ld.width, height: ld.height });
    if (agencyName) {
      p2.drawText(trunc(agencyName, 24).toUpperCase(), { x: 30 + ld.width + 12, y: H - 34, size: 9, font: fontB, color: GOLD });
    }
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
  for (const line of wrap(propertyData.description || "", 96).slice(0, 18)) {
    p2.drawText(line, { x: MARGIN, y: curY, size: 11, font: fontR, color: CHARCOAL, maxWidth: CW });
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
  const featCharsPerLine = Math.floor(colMaxW / 4.4);
  const lineH = 13;
  const gap = 8;
  let fy1 = curY, fy2 = curY;

  features.slice(0, half).slice(0, 10).forEach(f => {
    const fLines = wrap(f, featCharsPerLine).slice(0, 2);
    p2.drawRectangle({ x: MARGIN, y: fy1 + 3, width: 4, height: 4, color: GOLD });
    fLines.forEach((line, li) => {
      p2.drawText(line, { x: MARGIN + 10, y: fy1 - li * lineH, size: 9, font: fontR, color: CHARCOAL, maxWidth: colMaxW });
    });
    fy1 -= fLines.length * lineH + gap;
  });
  features.slice(half).slice(0, 10).forEach(f => {
    const fLines = wrap(f, featCharsPerLine).slice(0, 2);
    p2.drawRectangle({ x: col2X, y: fy2 + 3, width: 4, height: 4, color: GOLD });
    fLines.forEach((line, li) => {
      p2.drawText(line, { x: col2X + 10, y: fy2 - li * lineH, size: 9, font: fontR, color: CHARCOAL, maxWidth: colMaxW });
    });
    fy2 -= fLines.length * lineH + gap;
  });

  // Photo strip below features
  const lowestY = Math.min(fy1, fy2) - 20;
  if (lowestY > 120 && galleryPhotos.length > 0) {
    const stripTop = lowestY;
    const stripBottom = 36;
    const stripH = Math.min(stripTop - stripBottom, 280);
    const stripY = stripBottom;
    const count = Math.min(galleryPhotos.length, 3);
    const stripW = (CW - (count - 1) * 8) / count;
    for (let i = 0; i < count; i++) {
      const img = galleryPhotos[i];
      const dims = img.scaleToFit(stripW, stripH);
      p2.drawImage(img, {
        x: MARGIN + i * (stripW + 8) + (stripW - dims.width) / 2,
        y: stripY + (stripH - dims.height) / 2,
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
    const galTitleLines = wrap((propertyData.title || "").toUpperCase(), 56).slice(0, 2);
    const galHeaderH = galTitleLines.length > 1 ? 68 : 56;
    gp.drawRectangle({ x: 0, y: H - galHeaderH, width: W, height: galHeaderH, color: rgb(0.04, 0.04, 0.06) });
    gp.drawText(L("gallery"), { x: 36, y: H - 18, size: 7.5, font: fontB, color: MUTED });
    gp.drawRectangle({ x: 36, y: H - 24, width: 24, height: 1.5, color: GOLD });
    galTitleLines.forEach((line, li) => {
      gp.drawText(line, { x: 36, y: H - 38 - li * 14, size: 11, font: fontB, color: WHITE, maxWidth: W - 140 });
    });
    if (logoImg) {
      const ld = logoImg.scaleToFit(70, 36);
      gp.drawImage(logoImg, { x: W - ld.width - 20, y: H - galHeaderH + (galHeaderH - ld.height) / 2, width: ld.width, height: ld.height });
    }

    // 2 photos per page
    const pagePhotos = galleryPhotos.slice(gi, gi + 2);
    const hasTwo = pagePhotos.length === 2;
    const MX = 24, pTop = H - galHeaderH, pBot = 28, GAP = 10;
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
  const [resultData, setResultData] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
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
      setResultData(propertyData);
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

  const setCover = (i) => {
    if (i === 0) return;
    setPhotos(p => { const arr = [...p]; const [item] = arr.splice(i, 1); arr.unshift(item); return arr; });
    setPhotoUrls(u => { const arr = [...u]; const [item] = arr.splice(i, 1); arr.unshift(item); return arr; });
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
              <div style={S.fieldLabel}>Foto <span style={{ color: "#c8a96e" }}>*</span> <span style={{ fontWeight: 400, color: "#a09880" }}>· clicca "Copertina" su una foto per usarla come cover · max 40</span></div>
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
                          {i === 0
                            ? <div style={{ position: "absolute", bottom: 3, left: 3, background: "#c8a96e", color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>COVER</div>
                            : <button style={{ position: "absolute", bottom: 3, left: 3, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 3, cursor: "pointer" }} onClick={() => setCover(i)}>COPERTINA</button>}
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
              <button onClick={() => { setStatus("idle"); setSteps([]); setProgress(0); if (downloadUrl) URL.revokeObjectURL(downloadUrl); setDownloadUrl(null); setResultData(null); }}
                style={{ padding: "13px 26px", background: "#fff", border: "1px solid #e8e4de", borderRadius: 9, color: "#7a7060", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                ↺ Nuova proprietà
              </button>
            </div>

            {resultData && (
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #e8e4de", textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#c8a96e", marginBottom: 12 }}>
                  Email di accompagnamento ({LANGUAGES.find(l => l.code === targetLang)?.label})
                </div>
                <div style={S.fieldLabel}>Oggetto</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input
                    readOnly
                    value={buildEmailSubject(resultData, targetLang)}
                    style={{ ...S.input, color: "#4a4540", flex: 1 }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(buildEmailSubject(resultData, targetLang));
                      setSubjectCopied(true);
                      setTimeout(() => setSubjectCopied(false), 2000);
                    }}
                    style={{ ...S.btnOutline, flexShrink: 0 }}
                  >
                    {subjectCopied ? "✓" : "📋"}
                  </button>
                </div>
                <div style={S.fieldLabel}>Corpo</div>
                <textarea
                  readOnly
                  value={buildEmailText(resultData, targetLang, agencyName)}
                  style={{ ...S.textarea, minHeight: 220, fontSize: 12.5, color: "#4a4540" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(buildEmailText(resultData, targetLang, agencyName));
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    style={S.btnOutline}
                  >
                    {emailCopied ? "✓ Copiato" : "📋 Copia corpo"}
                  </button>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(buildEmailSubject(resultData, targetLang))}&body=${encodeURIComponent(buildEmailText(resultData, targetLang, agencyName))}`}
                    style={{ ...S.btnOutline, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                  >
                    ✉ Apri in email
                  </a>
                </div>
                <div style={{ fontSize: 11, color: "#a09880", marginTop: 8 }}>
                  Ricorda di allegare il PDF scaricato a questa email.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
