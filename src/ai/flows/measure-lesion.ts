'use server';

/**
 * @fileOverview A lesion measurement AI agent.
 *
 * - measureLesion - A function that handles the lesion measurement process.
 * - MeasureLesionInput - The input type for the measureLesion function.
 * - MeasureLesionOutput - The return type for the measureLesion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeasureLesionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a retina, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  lesionType: z.string().describe('The type of lesion to measure (e.g., diffuse edema, cystoid edema, SRF).'),
});
export type MeasureLesionInput = z.infer<typeof MeasureLesionInputSchema>;

const MeasureLesionOutputSchema = z.object({
  heightMicrons: z.number().describe('The height of the lesion in microns.'),
  widthMicrons: z.number().describe('The width of the lesion in microns.'),
  areaMicronsSquared: z.number().describe('The calculated area of the lesion in microns squared.'),
});
export type MeasureLesionOutput = z.infer<typeof MeasureLesionOutputSchema>;

export async function measureLesion(input: MeasureLesionInput): Promise<MeasureLesionOutput> {
  return measureLesionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'measureLesionPrompt',
  input: {schema: MeasureLesionInputSchema},
  output: {schema: MeasureLesionOutputSchema},
  prompt: `You are an expert ophthalmologist AI specializing in measuring retinal lesions from OCT scans. Your task is to analyze the provided image, identify the specified lesion, and return its measurements in microns.

**Instructions:**
1.  **Identify the Lesion:** Carefully locate the lesion of type '{{{lesionType}}}' in the provided image.
2.  **Measure Dimensions:**
    *   Determine the maximum **height** of the lesion.
    *   Determine the maximum **width** of the lesion.
3.  **Assume Scale:** Assume a 1:1 pixel-to-micron scale for this analysis.
4.  **Calculate Area:** Calculate the area as height * width.
5.  **Return Data:** Return the height, width, and area in the specified output format. Do not include units in the final output fields. If the lesion is not present, return 0 for all fields.

**Image to Analyze:**
{{media url=photoDataUri}}
`,
});

const measureLesionFlow = ai.defineFlow(
  {
    name: 'measureLesionFlow',
    inputSchema: MeasureLesionInputSchema,
    outputSchema: MeasureLesionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
