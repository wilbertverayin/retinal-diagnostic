'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/image-uploader';
import { ResultsDisplay } from '@/components/results-display';
import { getDiagnosis, getHighlightedImage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiagnoseImageOutput } from '@/ai/flows/diagnose-image';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { Loader2 } from 'lucide-react';

export function RetinaScanPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnoseImageOutput | null>(null);
  const [report, setReport] = useState<GenerateReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedImageCache, setHighlightedImageCache] = useState<Record<string, string>>({});
  const { toast } = useToast();


  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      handleReset(); // Reset everything for a new image
      setOriginalImage(dataUri);
      setAnnotatedImage(dataUri); // Show original image initially
      setIsLoading(true);

      const result = await getDiagnosis(dataUri);
      setIsLoading(false);

      if (result.error) {
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.error,
        });
        setOriginalImage(null);
      } else {
        setDiagnosis(result.diagnosis!);
        setReport(result.report!);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not read the selected image file.',
      });
      setIsLoading(false);
    };
  };

  const handleHighlightLesion = async (lesionType: string) => {
    if (!originalImage) return;

    if (lesionType === 'None') {
      setAnnotatedImage(originalImage);
      return;
    }
    
    if (highlightedImageCache[lesionType]) {
      setAnnotatedImage(highlightedImageCache[lesionType]);
      return;
    }

    setIsHighlighting(true);
    const result = await getHighlightedImage(originalImage, lesionType);
    setIsHighlighting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Highlighting Failed',
        description: result.error,
      });
    } else {
      const newAnnotatedImage = result.annotatedImage!;
      setAnnotatedImage(newAnnotatedImage);
      setHighlightedImageCache(prevCache => ({
        ...prevCache,
        [lesionType]: newAnnotatedImage,
      }));
    }
  };


  const handleReset = () => {
    setOriginalImage(null);
    setAnnotatedImage(null);
    setDiagnosis(null);
    setReport(null);
    setError(null);
    setIsLoading(false);
    setIsHighlighting(false);
    setHighlightedImageCache({});
  };

  if (!originalImage) {
    return <ImageUploader onImageUpload={handleImageUpload} />;
  }

  if (isLoading) {
    return (
      <Card className="bg-transparent border-border/60">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-16 h-16 animate-spin text-accent mb-6" />
          <h2 className="text-2xl font-headline text-glow mb-2">Analyzing Image...</h2>
          <p className="text-muted-foreground">The AI is processing the retinal scan. This may take a moment.</p>
          <div className="w-full max-w-md mt-6">
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResultsDisplay
      originalImage={originalImage}
      annotatedImage={annotatedImage}
      diagnosis={diagnosis}
      report={report}
      onHighlightLesion={handleHighlightLesion}
      isHighlighting={isHighlighting}
      onReset={handleReset}
    />
  );
}
