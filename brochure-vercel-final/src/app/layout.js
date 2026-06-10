export const metadata = {
  title: "Brochure Studio — Luxury Real Estate",
  description: "Trasforma schede italiane in brochure di lusso multilingua",
};
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
