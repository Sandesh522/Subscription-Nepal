import { Inter, Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex-mono" });

export const metadata = {
  title: "Premium Hub Nepal — Netflix, Spotify, Prime, ChatGPT & Claude",
  description: "Genuine premium plans for Netflix, Spotify, Prime Video, YouTube Premium, ChatGPT and Claude — priced in Nepali Rupees.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${sora.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
