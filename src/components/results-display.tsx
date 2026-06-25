'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Info, ZoomIn, ZoomOut, Redo, Download, Ruler } from 'lucide-react';
import type { DiagnoseImageOutput } from '@/ai/flows/diagnose-image';
import type { MeasureLesionOutput } from '@/ai/flows/measure-lesion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


interface ResultsDisplayProps {
  originalImage: string | null;
  annotatedImage: string | null;
  diagnosis: DiagnoseImageOutput | null;
  onHighlightLesion: (lesionType: string) => void;
  onMeasureLesion: (lesionType: string) => Promise<MeasureLesionOutput | null>;
  isHighlighting: boolean;
  onReset: () => void;
}

const lesionColorMapping: { [key: string]: string } = {
  'Diffuse edema': 'bg-yellow-400 border-yellow-400 text-yellow-900',
  'Hard exudates': 'bg-cyan-400 border-cyan-400 text-cyan-900',
  'Intraretinal cystoid fluid': 'bg-green-400 border-green-400 text-green-900',
  'Intraretinal hyperreflective foci': 'bg-teal-400 border-teal-400 text-teal-900',
  'Shadowing': 'bg-lime-400 border-lime-400 text-lime-900',
  'Subretinal fluid': 'bg-pink-400 border-pink-400 text-pink-900',
  'Drusen': 'bg-orange-400 border-orange-400 text-orange-900',
  'Vitreomacular Traction': 'bg-red-500 border-red-500 text-red-900',
  'Epiretinal membrane': 'bg-purple-500 border-purple-500 text-purple-900',
  'Macular hole': 'bg-indigo-500 border-indigo-500 text-indigo-900',
  'Vitreomacular Adhesion (VMA)': 'bg-violet-500 border-violet-500 text-violet-900',
  'Posterior Hyaloid Detachment (PVD)': 'bg-rose-500 border-rose-500 text-rose-900',
  'Confluent drusen': 'bg-orange-400 border-orange-400 text-orange-900',
  'Ellipsoid zone disruption': 'bg-purple-500 border-purple-500 text-purple-900',
  'Epiretinal fibrosis': 'bg-pink-400 border-pink-400 text-pink-900',
  'Posterior hyaloid membrane detachment': 'bg-rose-500 border-rose-500 text-rose-900',
  'RPE disruption': 'bg-teal-400 border-teal-400 text-teal-900',
};


const UrgencyIndicator = ({ value }: { value: number }) => {
  const urgencyText = value < 0.33 ? 'No referral needed' : value < 0.66 ? 'Routine referral recommended' : 'Urgent referral needed';
  const urgentTextPosition = value * 100;
  
  return (
    <div className='w-full'>
       <div className='relative h-2 w-full'>
        <div className='absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full'></div>
        <div 
          className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-500 rounded-full shadow'
          style={{ left: `${value * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>No referral needed</span>
        <span className='font-semibold' style={{ 
          position: 'absolute', 
          left: `${urgentTextPosition}%`, 
          transform: 'translateX(-50%)',
          color: 'hsl(var(--foreground))'
        }}>
          {value > 0.1 && value < 0.9 && urgencyText}
        </span>
        <span>Urgent referral needed</span>
      </div>
    </div>
  )
}

const LesionMeasurement = ({ lesionType, onMeasureLesion }: { lesionType: string; onMeasureLesion: (lesionType: string) => Promise<MeasureLesionOutput | null>; }) => {
  const [measurement, setMeasurement] = useState<MeasureLesionOutput | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const handleMeasure = async () => {
    setIsMeasuring(true);
    const result = await onMeasureLesion(lesionType);
    setMeasurement(result);
    setIsMeasuring(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8"
          onClick={handleMeasure}
        >
          {isMeasuring ? <Loader2 className="animate-spin" /> : <Ruler className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm">
        {measurement ? (
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Measurements</h4>
            <p className="text-muted-foreground">{lesionType}</p>
            <p><strong>Height:</strong> {measurement.heightMicrons.toFixed(2)} µm</p>
            <p><strong>Width:</strong> {measurement.widthMicrons.toFixed(2)} µm</p>
            <p><strong>Area:</strong> {measurement.areaMicronsSquared.toFixed(2)} µm²</p>
          </div>
        ) : (
          <p>Could not measure this lesion. It may not be present.</p>
        )}
      </PopoverContent>
    </Popover>
  );
};


export function ResultsDisplay({
  originalImage,
  annotatedImage,
  diagnosis,
  onHighlightLesion,
  onMeasureLesion,
  isHighlighting,
  onReset,
}: ResultsDisplayProps) {
  
  const [activeLesion, setActiveLesion] = useState<string>('All');

  const handleHighlightClick = (lesion: string) => {
    if (isHighlighting && activeLesion === lesion) {
      return;
    }
    setActiveLesion(lesion);
    onHighlightLesion(lesion);
  };
  
  const foundLesions = diagnosis?.lesions?.filter(l => l.present) || [];

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 h-full bg-secondary/40 print:bg-white print:text-black">
      {/* Left Panel */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <Card className='shadow-md'>
            <CardHeader>
                <CardTitle>Referral Urgency Score</CardTitle>
            </CardHeader>
            <CardContent>
                <UrgencyIndicator value={diagnosis?.referralUrgency || 0} />
            </CardContent>
        </Card>

        <Card className='shadow-md'>
          <CardHeader>
            <CardTitle>Segmentations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             <div className="flex items-center justify-between gap-2 text-sm font-medium">
                <p>All</p>
                <Button
                  size="sm"
                  variant={activeLesion === 'All' ? 'default' : 'outline'}
                  className="w-28"
                  onClick={() => handleHighlightClick('All')}
                >
                  <Check className="mr-2 h-4 w-4" /> Highlight
                </Button>
              </div>
            {foundLesions.map(({ name, confidence }) => (
              <div key={name} className="flex items-center justify-between gap-2 text-sm font-medium">
                <p className="flex-1 truncate">{name}</p>
                <div className='flex items-center gap-2'>
                    <div className={cn('w-4 h-4 rounded-full', lesionColorMapping[name] || 'bg-gray-400')}></div>
                    <span>{confidence.toFixed(0)}%</span>
                </div>
                 <LesionMeasurement lesionType={name} onMeasureLesion={onMeasureLesion} />
                <Button
                  size="sm"
                  variant={activeLesion === name ? 'default' : 'outline'}
                  className="w-28"
                  onClick={() => handleHighlightClick(name)}
                  disabled={isHighlighting && activeLesion === name}
                >
                  {isHighlighting && activeLesion === name ? <Loader2 className="animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Highlight</>}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='shadow-md'>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lg font-semibold text-primary'>{diagnosis?.classification}</p>
            <p className='text-sm text-muted-foreground mt-1'>{diagnosis?.summary}</p>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-2 no-print'>
           <Button variant="outline" size="lg" onClick={() => window.print()}>
            <Download className="mr-2"/> Add to report
           </Button>
           <Button variant="secondary" size="lg" onClick={onReset}>
            <Redo className="mr-2"/> Review other scans
           </Button>
        </div>
      </div>
      
      {/* Right Panel - Image Viewer */}
      <div className="lg:col-span-8 xl:col-span-9">
        <Card className="shadow-md h-full flex flex-col">
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle>Severity: <span className='text-yellow-500'>Yellow</span></CardTitle>
                    <CardDescription className='flex items-center gap-1'>
                        <Info className='w-4 h-4'/> Pathologies Detected
                    </CardDescription>
                </div>
                 <p className='text-muted-foreground font-medium'>Visit 1, 2024</p>
            </CardHeader>
            <CardContent className='flex-grow relative'>
              <div className="relative w-full h-full flex items-center justify-center">
                  {isHighlighting && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                      <Loader2 className="animate-spin text-primary w-12 h-12" />
                    </div>
                  )}
                  <Image
                    src={annotatedImage || originalImage || ''}
                    alt="Annotated Ophthalmic Image"
                    width={1000}
                    height={1000}
                    className="rounded-lg border-2 border-border object-contain w-full h-auto max-h-[calc(100vh-280px)]"
                    data-ai-hint="medical scan"
                  />
                  <div className='absolute top-2 right-2 flex flex-col gap-2 no-print'>
                      <Button variant="outline" size="icon"><ZoomIn/></Button>
                      <Button variant="outline" size="icon"><ZoomOut/></Button>
                  </div>
                   <div className='absolute -right-12 top-1/2 -translate-y-1/2 h-48 w-8 bg-gray-200 rounded-full flex flex-col items-center justify-between p-2 no-print'>
                      <div className='w-full h-1 bg-gray-300'></div>
                      <div className='w-full h-1 bg-gray-300'></div>
                   </div>
              </div>
            </CardContent>
        </Card>
      </div>

       <div className='hidden print:block col-span-12'>
          <h2 className="text-xl font-bold mb-4 text-black">Annotated Image ({activeLesion || 'None'})</h2>
            {annotatedImage && (
              <Image
              src={annotatedImage}
              alt="Annotated Ophthalmic Image"
              width={800}
              height={800}
              className="rounded-lg border object-contain w-full h-auto aspect-square"
            />
          )}
          <div className='mt-8'>
             <h3 className="text-lg font-bold mb-2 text-black">Classification</h3>
             <p className='text-lg font-semibold'>{diagnosis?.classification}</p>
             <p className='text-md'>{diagnosis?.summary}</p>
          </div>
        </div>

    </div>
  );
}
