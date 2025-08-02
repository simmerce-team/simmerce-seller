import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main 
        id="main-content"
        className="min-h-screen container mx-auto py-10"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
    </>
  );
}
