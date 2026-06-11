/**
 * Layout specifico per il viewer PDF.
 * Nasconde il Footer (logo ASSUML "vagante") e la Navbar sul viewer full-screen.
 * Il root layout si applica ancora, ma questi elementi vengono soppressi.
 */
export default function ViewerLayout({ children }) {
  return (
    <>
      <style>{`
        /* Viewer PDF: nascondi Footer e Navbar per esperienza full-screen */
        footer { display: none !important; }
        header { display: none !important; }
        main   { padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  )
}
