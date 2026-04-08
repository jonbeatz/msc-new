/**
 * Shell layouts live in route groups:
 * - `app/(site)/layout.tsx` — marketing (`<html>` / `<body>`)
 * - `app/(payload)/layout.tsx` — Payload admin (full document via RootLayout)
 *
 * This file exists so Next has a single root `layout.tsx`. It must not wrap
 * `children` in another `<html>` / `<body>` (that would nest Payload's document
 * and break `/admin`). Per Next.js, nested groups supply the document.
 */
export default function RootPassthroughLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
