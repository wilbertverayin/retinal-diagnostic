// AI features disabled for static build

import { detectLesions } from '@/ai/flows/detect-lesions';
import { diagnoseImage } from '@/ai/flows/diagnose-image';
import { generateReport } from '@/ai/flows/generate-report';
import { measureLesion } from '@/ai/flows/measure-lesion';

export async function getDiagnosis(photoDataUri: string) {
  try {
    const diagnosisResult = await diagnoseImage({ photoDataUri });
    return { diagnosis: diagnosisResult, report: null };
  } catch (e) {
    console.error('getDiagnosis error:', e);
    return { error: 'An unexpected error occurred during AI analysis. Please try again.' };
  }
}

export async function getHighlightedImage(photoDataUri: string, lesionToHighlight: string) {
  try {
    const result = await detectLesions({ photoDataUri, lesionToHighlight });
    return { annotatedImage: result.annotatedImage };
  } catch (e) {
    console.error('getHighlightedImage error:', e);
    return { error: 'An unexpected error occurred while highlighting the lesion.' };
  }
}

export async function getLesionMeasurement(photoDataUri: string, lesionType: string) {
  try {
    const result = await measureLesion({ photoDataUri, lesionType });
    return { measurement: result };
  } catch (e) {
    console.error('getLesionMeasurement error:', e);
    return { error: 'An unexpected error occurred while measuring the lesion.' };
  }
}
