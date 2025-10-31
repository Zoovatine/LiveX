export const metadata = {
  title: "Live Tracker",
  description: "Live totals for streamers"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#0f172a", color: "#fff", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
