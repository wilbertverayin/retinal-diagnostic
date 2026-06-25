'use server';
/**
 * @fileOverview An AI agent for diagnosing ophthalmic images.
 *
 * - diagnoseImage - A function that analyzes an image to identify lesions and provide a summary.
 * - DiagnoseImageInput - The input type for the diagnoseImage function.
 * - DiagnoseImageOutput - The return type for the diagnoseImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LesionDetailSchema = z.object({
  name: z.string().describe('The name of the lesion type.'),
  present: z.boolean().describe('Whether this lesion is present in the image.'),
  confidence: z.number().describe('The confidence score (0-100) of the presence of this lesion.'),
});

const DiagnoseImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ophthalmic image (OCT or fundus), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseImageInput = z.infer<typeof DiagnoseImageInputSchema>;

const DiagnoseImageOutputSchema = z.object({
  summary: z.string().describe('A concise, one to two sentence clinical summary of the findings, correlating them to potential pathologies.'),
  lesions: z.array(LesionDetailSchema).describe('A list of all potential lesions and whether they were detected.'),
  classification: z.string().describe('The final overall classification or diagnosis for the eye scan (e.g., "Dry AMD", "Diabetic Macular Edema", "Normal").'),
  referralUrgency: z.number().min(0).max(1).describe('A score from 0.0 (no referral needed) to 1.0 (urgent referral needed) indicating the severity and need for follow-up.'),
});
export type DiagnoseImageOutput = z.infer<typeof DiagnoseImageOutputSchema>;

export async function diagnoseImage(input: DiagnoseImageInput): Promise<DiagnoseImageOutput> {
  return diagnoseImageFlow(input);
}

const allLesionTypes = [
  'Confluent drusen',
  'Ellipsoid zone disruption',
  'Epiretinal fibrosis',
  'Intraretinal hyperreflective foci',
  'Posterior hyaloid membrane detachment',
  'RPE disruption',
  'Drusen',
  'Diffuse edema',
  'Hard exudates',
  'Intraretinal cystoid fluid',
  'Shadowing',
  'Subretinal fluid',
  'Vitreomacular Adhesion (VMA)',
  'Vitreomacular Traction',
  'Epiretinal membrane',
  'Macular hole',
  'Posterior Hyaloid Detachment (PVD)',
];

const prompt = ai.definePrompt({
  name: 'diagnoseImagePrompt',
  input: {schema: DiagnoseImageInputSchema},
  output: {schema: DiagnoseImageOutputSchema},
  prompt: `You are an expert ophthalmologist AI, specializing in analyzing OCT and fundus images. Your task is to analyze the provided ophthalmic image and provide a detailed diagnosis.

**Lesion Knowledge Base:**
- **Posterior Hyaloid Detachment (PVD) / Posterior hyaloid membrane detachment:** Separation of the posterior vitreous cortex from the retinal surface. Appears as a thin, hyporeflective line above the retina.
- **Vitreomacular Adhesion (VMA):** PVD where the hyaloid remains attached to the macula within a 3-mm radius without causing distortion.
- **Vitreomacular Traction (VMT):** Vitreous attachment to the macula causing clear distortion or structural changes. More severe than VMA.
- **Drusen / Confluent drusen:** Localized elevations of the RPE layer, seen as small, bumpy accumulations under the retina. If they merge, they are confluent.
- **Intraretinal cystoid fluid:** Hyporeflective (dark), well-defined, round/oval spaces within retinal layers.
- **Subretinal fluid:** Hyporeflective space between the neurosensory retina and the RPE.
- **Diffuse edema:** General thickening and disorganization of retinal layers.
- **Hard exudates:** Hyperreflective (bright) deposits, usually in the outer plexiform layer.
- **Intraretinal hyperreflective foci:** Small, bright, dot-like lesions within the retina.
- **Epiretinal membrane (ERM) / Epiretinal fibrosis:** A hyperreflective line growing over the inner retinal surface. If it's thicker and more established, it's fibrosis.
- **Ellipsoid zone disruption:** Discontinuity or loss of the hyperreflective band corresponding to the photoreceptor inner/outer segment junction.
- **RPE disruption:** Irregularity, thickening, or atrophy of the Retinal Pigment Epithelium layer.
- **Macular hole:** A full-thickness defect in the foveal center.
- **Shadowing:** Artifact where a dense lesion blocks the OCT light, creating a dark shadow beneath it.

**Instructions:**
1.  **Analyze the Image:** First, carefully examine the provided image for any abnormalities based on the knowledge base.
2.  **Identify Lesions & Confidence:** For each potential lesion from this list (${allLesionTypes.join(', ')}), determine if it is present. For each lesion, provide a confidence score from 0-100 indicating your certainty. If a lesion is not present, set its confidence to 0 and 'present' to false.
3.  **Determine Classification:** Based on all your findings, provide a single, primary classification for the scan (e.g., "Dry AMD", "Normal", "Diabetic Macular Edema").
4.  **Calculate Referral Urgency:** Provide a score from 0.0 (no referral needed) to 1.0 (urgent referral needed) based on the severity of the findings. A normal scan would be 0.0, while a condition like Wet AMD or a full thickness macular hole would be closer to 1.0.
5.  **Provide Clinical Summary:** Write a brief, one- or two-sentence clinical summary of your findings.

**Image to Analyze:**
{{media url=photoDataUri}}`,
});

const diagnoseImageFlow = ai.defineFlow(
  {
    name: 'diagnoseImageFlow',
    inputSchema: DiagnoseImageInputSchema,
    outputSchema: DiagnoseImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
