import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const LABELS = {
  features:    { en:"KEY FEATURES", pt:"CARACTERÍSTICAS", fr:"CARACTÉRISTIQUES", de:"AUSSTATTUNG", es:"CARACTERÍSTICAS", zh:"特点", ar:"المميزات", ru:"ОСОБЕННОСТИ", nl:"KENMERKEN", sv:"EGENSKAPER" },
  description: { en:"DESCRIPTION",  pt:"DESCRIÇÃO",       fr:"DESCRIPTION",      de:"BESCHREIBUNG", es:"DESCRIPCIÓN",    zh:"描述", ar:"الوصف",    ru:"ОПИСАНИЕ",     nl:"BESCHRIJVING", sv:"BESKRIVNING" },
  gallery:     { en:"PHOTO GALLERY",pt:"GALERIA",         fr:"GALERIE PHOTOS",   de:"FOTOGALERIE",  es:"GALERÍA",        zh:"照片库", ar:"معرض الصور", ru:"ГАЛЕРЕЯ",    nl:"GALERIJ",      sv:"GALLERI" },
  surface:     { en:"AREA",         pt:"ÁREA",            fr:"SUPERFICIE",       de:"FLÄCHE",       es:"SUPERFICIE",     zh:"面积", ar:"المساحة",  ru:"ПЛОЩАДЬ",      nl:"OPPERVLAK",    sv:"YTA" },
  rooms:       { en:"ROOMS",        pt:"DIVISÕES",        fr:"PIÈCES",           de:"ZIMMER",       es:"HABITACIONES",   zh:"房间", ar:"الغرف",    ru:"КОМНАТЫ",      nl:"KAMERS",       sv:"RUM" },
  location:    { en:"LOCATION",     pt:"LOCALIZAÇÃO",     fr:"EMPLACEMENT",      de:"LAGE",         es:"UBICACIÓN",      zh:"位置", ar:"الموقع",   ru:"РАСПОЛОЖЕНИЕ", nl:"LOCATIE",      sv:"LÄGE" },
  confidential:{ en:"CONFIDENTIAL · FOR QUALIFIED BUYERS ONLY", pt:"CONFIDENCIAL · APENAS PARA COMPRADORES QUALIFICADOS", fr:"CONFIDENTIEL · POUR ACHETEURS QUALIFIÉS", de:"VERTRAULICH · NUR FÜR QUALIFIZIERTE KÄUFER", es:"CONFIDENCIAL · SOLO PARA COMPRADORES CALIFICADOS", zh:"机密 · 仅供合格买家", ar:"سري · للمشترين المؤهلين فقط", ru:"КОНФИДЕНЦИАЛЬНО · ТОЛЬКО ДЛЯ КВАЛИФИЦИРОВАННЫХ ПОКУПАТЕЛЕЙ", nl:"VERTROUWELIJK · ALLEEN VOOR GEKWALIFICEERDE KOPERS", sv:"KONFIDENTIELLT · ENDAST FÖR KVALIFICERADE KÖPARE" },
};

function L(key, lang) {
  return (LABELS[key] && (LABELS[key][lang] || LABELS[key]["en"])) || key;
}

function buildHTML(propertyData, photos, logoBase64, agencyName, lang) {
  const coverPhoto = photos[0] || "";
  const galleryPhotos = photos.slice(1);
  const label = (k) => L(k, lang);

  // Build gallery pages HTML — 2 photos per page
  let galleryPagesHTML = "";
  for (let i = 0; i < galleryPhotos.length; i += 2) {
    const p1 = galleryPhotos[i];
    const p2 = galleryPhotos[i + 1] || null;
    galleryPagesHTML += `
    <div class="page gallery-page">
      <div class="gallery-header">
        <div class="gallery-header-left">
          <div class="gold-rule-sm"></div>
          <span class="gallery-label">${label("gallery")}</span>
          <span class="gallery-title">${esc(propertyData.title || "")}</span>
        </div>
        ${logoBase64 ? `<img class="gallery-logo" src="${logoBase64}" alt="logo"/>` : `<span class="gallery-agency">${esc(agencyName)}</span>`}
      </div>
      <div class="gallery-photos ${p2 ? "two-photos" : "one-photo"}">
        <div class="gallery-photo-wrap"><img src="${p1}" class="gallery-photo"/></div>
        ${p2 ? `<div class="gallery-photo-wrap"><img src="${p2}" class="gallery-photo"/></div>` : ""}
      </div>
      <div class="page-footer">
        <span class="footer-confidential">${label("confidential")}</span>
        <span class="footer-page">${3 + Math.floor(i / 2)} / ${2 + Math.ceil(galleryPhotos.length / 2)}</span>
      </div>
    </div>`;
  }

  const totalPages = 2 + Math.ceil(galleryPhotos.length / 2);
  const featuresList = (propertyData.features || []);
  const half = Math.ceil(featuresList.length / 2);
  const leftFeats = featuresList.slice(0, half);
  const rightFeats = featuresList.slice(half);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Montserrat', sans-serif; background: white; color: #1a1a1a; -webkit-print-color-adjust: exact; }

  .page {
    width: 210mm;
    min-height: 297mm;
    height: 297mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    background: white;
  }

  /* ── COVER ── */
  .cover-page { background: #0e0e12; }

  .cover-photo {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 68%;
    overflow: hidden;
  }
  .cover-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .cover-logo {
    position: absolute;
    top: 20px; right: 24px;
    max-height: 40px;
    max-width: 90px;
    object-fit: contain;
  }
  .cover-agency-name {
    position: absolute;
    top: 24px; right: 24px;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #c8a96e;
    text-transform: uppercase;
  }

  .cover-content {
    position: absolute;
    bottom: 32px;
    left: 0; right: 0;
    padding: 0 36px;
  }
  .cover-rule {
    width: 40px; height: 1.5px;
    background: #c8a96e;
    margin-bottom: 16px;
  }
  .cover-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.15;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }
  .cover-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    font-style: italic;
    font-weight: 300;
    color: #c8a96e;
    margin-bottom: 20px;
    line-height: 1.4;
  }
  .cover-separator { width: 100%; height: 0.5px; background: rgba(200,169,110,0.3); margin-bottom: 16px; }

  .cover-stats {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
  }
  .cover-stat {
    flex: 1;
    border-right: 0.5px solid rgba(200,169,110,0.2);
    padding-right: 16px;
    margin-right: 16px;
  }
  .cover-stat:last-child { border-right: none; }
  .cover-stat-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cover-stat-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 7px;
    font-weight: 400;
    color: #7a7060;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 3px;
    display: block;
  }
  .cover-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: #c8a96e;
    letter-spacing: 1px;
  }

  /* ── FOOTER (all pages) ── */
  .page-footer {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 26px;
    background: #0e0e12;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
  }
  .footer-left { display: flex; align-items: center; gap: 10px; }
  .footer-logo { max-height: 14px; max-width: 48px; object-fit: contain; }
  .footer-agency { font-size: 6.5px; font-weight: 600; color: #c8a96e; letter-spacing: 1.5px; text-transform: uppercase; }
  .footer-confidential { font-size: 6px; font-weight: 400; color: #5a5248; letter-spacing: 0.8px; text-transform: uppercase; }
  .footer-page { font-size: 6.5px; font-weight: 400; color: #5a5248; }

  /* ── DESCRIPTION PAGE ── */
  .desc-page { background: #ffffff; }

  .desc-header {
    width: 100%;
    height: 60px;
    background: #0e0e12;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    flex-shrink: 0;
  }
  .desc-header-logo { max-height: 32px; max-width: 80px; object-fit: contain; }
  .desc-header-agency { font-size: 10px; font-weight: 600; color: #c8a96e; letter-spacing: 2px; text-transform: uppercase; }
  .desc-header-right { font-size: 7px; color: #5a5248; letter-spacing: 2px; text-transform: uppercase; }

  .desc-body {
    padding: 32px 36px 32px;
    height: calc(297mm - 60px - 26px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .section-label-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .gold-rule { width: 28px; height: 1.5px; background: #c8a96e; flex-shrink: 0; }
  .gold-rule-sm { width: 20px; height: 1.5px; background: #c8a96e; flex-shrink: 0; }
  .section-label { font-size: 8px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #9a8f7e; }

  .description-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13.5px;
    font-weight: 400;
    color: #2a2520;
    line-height: 1.75;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .section-divider { width: 100%; height: 0.5px; background: rgba(200,169,110,0.3); margin: 20px 0; flex-shrink: 0; }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
    flex-shrink: 0;
  }
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 9.5px;
    color: #2a2520;
    line-height: 1.4;
  }
  .feature-dot {
    width: 4px; height: 4px;
    background: #c8a96e;
    border-radius: 0;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .photo-strip {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 16px;
    flex-shrink: 0;
  }
  .photo-strip-item {
    flex: 1;
    height: 110px;
    overflow: hidden;
    border-radius: 2px;
  }
  .photo-strip-item img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── GALLERY PAGES ── */
  .gallery-page { background: #f7f5f2; }

  .gallery-header {
    height: 48px;
    background: #0e0e12;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    flex-shrink: 0;
  }
  .gallery-header-left { display: flex; align-items: center; gap: 12px; }
  .gallery-label { font-size: 7px; font-weight: 600; letter-spacing: 2px; color: #7a7060; text-transform: uppercase; }
  .gallery-title { font-family: 'Cormorant Garamond', serif; font-size: 13px; font-weight: 600; color: #e8e4dc; letter-spacing: 0.5px; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gallery-logo { max-height: 28px; max-width: 70px; object-fit: contain; }
  .gallery-agency { font-size: 8px; font-weight: 600; color: #c8a96e; letter-spacing: 1.5px; text-transform: uppercase; }

  .gallery-photos {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 24px;
    height: calc(297mm - 48px - 26px);
    overflow: hidden;
  }
  .gallery-photos.two-photos .gallery-photo-wrap { flex: 1; overflow: hidden; border-radius: 2px; background: #eee; }
  .gallery-photos.one-photo .gallery-photo-wrap { flex: 1; overflow: hidden; border-radius: 2px; background: #eee; }
  .gallery-photo { width: 100%; height: 100%; object-fit: cover; display: block; }

  @media print {
    .page { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- ══ PAGE 1: COVER ══ -->
<div class="page cover-page">
  <div class="cover-photo">
    <img src="${coverPhoto}" alt="cover"/>
  </div>

  ${logoBase64
    ? `<img class="cover-logo" src="${logoBase64}" alt="logo"/>`
    : agencyName ? `<span class="cover-agency-name">${esc(agencyName)}</span>` : ""}

  <div class="cover-content">
    <div class="cover-rule"></div>
    <div class="cover-title">${esc(propertyData.title || "Exclusive Property")}</div>
    ${propertyData.tagline ? `<div class="cover-tagline">${esc(propertyData.tagline)}</div>` : ""}
    <div class="cover-separator"></div>
    <div class="cover-stats">
      ${propertyData.surface ? `<div class="cover-stat"><span class="cover-stat-value">${esc(propertyData.surface)}</span><span class="cover-stat-label">${label("surface")}</span></div>` : ""}
      ${propertyData.rooms   ? `<div class="cover-stat"><span class="cover-stat-value">${esc(propertyData.rooms)}</span><span class="cover-stat-label">${label("rooms")}</span></div>` : ""}
      ${propertyData.location? `<div class="cover-stat"><span class="cover-stat-value">${esc(propertyData.location)}</span><span class="cover-stat-label">${label("location")}</span></div>` : ""}
    </div>
    ${propertyData.price ? `<div class="cover-price">${esc(propertyData.price)}</div>` : ""}
  </div>

  <div class="page-footer">
    <span class="footer-confidential">${label("confidential")}</span>
    <span class="footer-page">1 / ${totalPages}</span>
  </div>
</div>

<!-- ══ PAGE 2: DESCRIPTION ══ -->
<div class="page desc-page">
  <div class="desc-header">
    ${logoBase64
      ? `<img class="desc-header-logo" src="${logoBase64}" alt="logo"/>`
      : `<span class="desc-header-agency">${esc(agencyName)}</span>`}
    <span class="desc-header-right">LUXURY REAL ESTATE</span>
  </div>

  <div class="desc-body">
    <div class="section-label-row">
      <div class="gold-rule"></div>
      <span class="section-label">${label("description")}</span>
    </div>
    <div class="description-text">${esc(propertyData.description || "")}</div>

    <div class="section-divider"></div>

    <div class="section-label-row">
      <div class="gold-rule"></div>
      <span class="section-label">${label("features")}</span>
    </div>
    <div class="features-grid">
      ${featuresList.map(f => `<div class="feature-item"><div class="feature-dot"></div><span>${esc(f)}</span></div>`).join("")}
    </div>

    ${galleryPhotos.length > 0 ? `
    <div class="photo-strip">
      ${galleryPhotos.slice(0, 3).map(p => `<div class="photo-strip-item"><img src="${p}" alt=""/></div>`).join("")}
    </div>` : ""}
  </div>

  <div class="page-footer">
    <div class="footer-left">
      ${logoBase64 ? `<img class="footer-logo" src="${logoBase64}" alt="logo"/>` : `<span class="footer-agency">${esc(agencyName)}</span>`}
      <span class="footer-confidential">${label("confidential")}</span>
    </div>
    <span class="footer-page">2 / ${totalPages}</span>
  </div>
</div>

<!-- ══ GALLERY PAGES ══ -->
${galleryPagesHTML}

</body>
</html>`;
}

function esc(str) {
  return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export async function POST(request) {
  let browser = null;
  try {
    const formData = await request.formData();
    const propertyData = JSON.parse(formData.get("propertyData"));
    const targetLang = formData.get("targetLang") || "en";
    const agencyName = formData.get("agencyName") || "";

    // Logo
    let logoBase64 = null;
    const logoFile = formData.get("logo");
    if (logoFile && logoFile.size > 0) {
      const logoBytes = await logoFile.arrayBuffer();
      const logoB64 = Buffer.from(logoBytes).toString("base64");
      logoBase64 = `data:${logoFile.type};base64,${logoB64}`;
    }

    // Photos
    const photos = [];
    let i = 0;
    while (formData.get(`photo_${i}`)) {
      const photoFile = formData.get(`photo_${i}`);
      const photoBytes = await photoFile.arrayBuffer();
      const photoB64 = Buffer.from(photoBytes).toString("base64");
      photos.push(`data:${photoFile.type};base64,${photoB64}`);
      i++;
    }

    const html = buildHTML(propertyData, photos, logoBase64, agencyName, targetLang);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="brochure.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
