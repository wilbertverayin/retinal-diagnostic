'use server';

/**
 * @fileOverview Highlights a specific lesion in an ophthalmic image.
 *
 * - detectLesions - A function that accepts an image and a lesion type, returning the image with the specified lesion highlighted.
 * - DetectLesionsInput - The input type for the detectLesions function.
 * - DetectLesionsOutput - The return type for the detectLesions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const lesionColorMapping: { [key: string]: string } = {
  'Diffuse edema': 'bright yellow',
  'Hard exudates': 'bright cyan',
  'Intraretinal cystoid fluid': 'bright green',
  'Intraretinal hyperreflective foci': 'bright teal',
  'Shadowing': 'bright lime',
  'Subretinal fluid': 'bright pink',
  'Drusen': 'bright orange',
  'Vitreomacular Traction': 'bright red',
  'Epiretinal membrane': 'bright purple',
  'Macular hole': 'bright indigo',
  'Vitreomacular Adhesion (VMA)': 'bright violet',
  'Posterior Hyaloid Detachment (PVD)': 'bright rose',
  'Confluent drusen': 'bright orange',
  'Ellipsoid zone disruption': 'bright purple',
  'Epiretinal fibrosis': 'bright pink',
  'Posterior hyaloid membrane detachment': 'bright rose',
  'RPE disruption': 'bright teal',
};


const DetectLesionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ophthalmic image (OCT or fundus), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  lesionToHighlight: z.string().describe('The specific type of lesion to highlight on the image.'),
});
export type DetectLesionsInput = z.infer<typeof DetectLesionsInputSchema>;

const DetectLesionsOutputSchema = z.object({
  annotatedImage: z
    .string()
    .describe(
      'The original image with the specified lesion highlighted, as a data URI.'
    ),
});
export type DetectLesionsOutput = z.infer<typeof DetectLesionsOutputSchema>;

export async function detectLesions(input: DetectLesionsInput): Promise<DetectLesionsOutput> {
  return detectLesionsFlow(input);
}

const detectLesionsFlow = ai.defineFlow(
  {
    name: 'detectLesionsFlow',
    inputSchema: DetectLesionsInputSchema,
    outputSchema: DetectLesionsOutputSchema,
  },
  async ({ photoDataUri, lesionToHighlight }) => {
    const color = lesionColorMapping[lesionToHighlight] || 'a bright, contrasting color';

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: photoDataUri}},
        {
          text: `You are an expert AI assistant for ophthalmologists. Your task is to process the provided ophthalmic image. On the image, find and highlight **ONLY** the specific lesion named "${lesionToHighlight}". Use a distinct, ${color} overlay or outline for the highlight. Return **ONLY** the modified original image. Do not add any text, labels, or other diagrams. Do not highlight any other findings. If the specified lesion is not present, you MUST return the original image completely unmodified.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate annotated image.');
    }

    return {annotatedImage: media.url};
  }
);
