'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileScan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setIsDragging(false);
      if (rejectedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload a JPG or PNG image.',
        });
        return;
      }
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className='p-4 md:p-8'>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
              <FileScan className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl">Upload Image</CardTitle>
          <CardDescription className="text-base">Drag and drop a JPG or PNG file, or click to select a file.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive || isDragging ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <UploadCloud className="w-16 h-16 text-primary/80" />
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm">Supported formats: JPG, PNG</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
