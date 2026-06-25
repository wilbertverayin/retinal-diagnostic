import { MaculaScanPage } from '@/components/macula-scan-page';
import { Eye } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 px-4 md:px-8 border-b bg-card no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="4"/>
              <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="4"/>
              <circle cx="24" cy="24" r="4" fill="white"/>
            </svg>
            <h1 className="text-2xl font-bold text-foreground">
              Retina Scan
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <MaculaScanPage />
      </main>
    </div>
  );
}
