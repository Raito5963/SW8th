// app/layout.tsx
import Header from "./_components/header";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
export const metadata = {
  title: "gaga friends",
  description: "みんなが集まるコミュニティ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {/* Emotion CacheProvider でラップ */}
        <AppRouterCacheProvider>
          <Header />
          <main>
            {children}
          </main>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
