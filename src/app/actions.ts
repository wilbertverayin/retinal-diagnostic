'use server';

import { detectLesions } from '@/ai/flows/detect-lesions';
import { diagnoseImage } from '@/ai/flows/diagnose-image';
import { generateReport } from '@/ai/flows/generate-report';
import { measureLesion } from '@/ai/flows/measure-lesion';
import { z } from 'zod';

const imageSchema = z.string().startsWith('data:image/', { message: "Input must be a valid data URI." });

export async function getDiagnosis(photoDataUri: string) {
  const validation = imageSchema.safeParse(photoDataUri);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }
  try {
    const diagnosisResult = await diagnoseImage({ photoDataUri });
    
    // The report generation is not used in the current UI, so we can remove it.
    // const reportResult = await generateReport({ photoDataUri });
    
    return { diagnosis: diagnosisResult, report: null };

  } catch (e) {
    console.error('getDiagnosis error:', e);
    return { error: 'An unexpected error occurred during AI analysis. Please try again.' };
  }
}


export async function getHighlightedImage(photoDataUri: string, lesionToHighlight: string) {
  const imageValidation = imageSchema.safeParse(photoDataUri);
  if (!imageValidation.success) {
    return { error: imageValidation.error.errors[0].message };
  }
  
  const lesionValidation = z.string().min(1, { message: "Lesion type must be provided." }).safeParse(lesionToHighlight);
  if(!lesionValidation.success) {
    return { error: lesionValidation.error.errors[0].message };
  }

  try {
    const result = await detectLesions({ photoDataUri, lesionToHighlight });
    return { annotatedImage: result.annotatedImage };
  } catch (e) {
    console.error('getHighlightedImage error:', e);
    return { error: 'An unexpected error occurred while highlighting the lesion.' };
  }
}

export async function getLesionMeasurement(photoDataUri: string, lesionType: string) {
  const imageValidation = imageSchema.safeParse(photoDataUri);
  if (!imageValidation.success) {
    return { error: imageValidation.error.errors[0].message };
  }

  const lesionValidation = z.string().min(1, { message: "Lesion type must be provided." }).safeParse(lesionType);
  if(!lesionValidation.success) {
    return { error: lesionValidation.error.errors[0].message };
  }
  
  try {
    const result = await measureLesion({ photoDataUri, lesionType });
    return { measurement: result };
  } catch (e) {
    console.error('getLesionMeasurement error:', e);
    return { error: 'An unexpected error occurred while measuring the lesion.' };
  }
}
