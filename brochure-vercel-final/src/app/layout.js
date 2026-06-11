export const metadata = {
  title: "Brochure Studio — Luxury Real Estate",
  description: "Trasforma schede italiane in brochure di lusso multilingua",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.loadPdfLibIfNeeded = function() {
                if (window.PDFLib) return Promise.resolve(window.PDFLib);
                return new Promise(function(resolve, reject) {
                  var s = document.createElement('script');
                  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
                  s.onload = function() { resolve(window.PDFLib); };
                  s.onerror = function() { reject(new Error('Cannot load pdf-lib')); };
                  document.head.appendChild(s);
                });
              };
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
