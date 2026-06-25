'use server';

/**
 * @fileOverview An AI agent for generating a detailed report from an ophthalmic image.
 *
 * - generateReport - A function that analyzes an image to produce a structured clinical report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an ophthalmic image (OCT or fundus), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  interpretation: z.object({
    normalRetinalArchitecture: z.string().describe('Analysis of the overall retinal structure, layers, and continuity. Describe what you see.'),
    fovealContour: z.string().describe('Assessment of the foveal depression and any abnormalities. Describe what you see.'),
    rpe: z.string().describe('Evaluation of the Retinal Pigment Epithelium (RPE) layer for integrity and abnormalities. Describe what you see.'),
    outerRetinalLayers: z.string().describe('Analysis of the outer retinal layers, including the ellipsoid zone. Describe what you see.'),
    choroid: z.string().describe('Observations about the choroid and choroidal-scleral interface. Describe what you see.'),
  }).describe('A detailed, section-by-section interpretation of the retinal image.'),
  summary: z.string().describe('A concise clinical summary correlating findings to potential pathologies and concluding with an overall assessment. If the scan appears normal but a patient has symptoms, suggest potential next steps or considerations.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an expert ophthalmologist AI. Your task is to generate a detailed, structured clinical report based *only* on the provided ophthalmic image. Do not assume the image is normal. Describe what you see. Follow this exact structure for your response:

1.  **Interpretation Section:** For each point below, provide a clinical description based on your direct observation of the image.
    *   **Retinal Architecture:** Describe the preservation, continuity, and layering of the retinal structure. Note any cystoid spaces, subretinal fluid, or other pathologies you observe.
    *   **Foveal Contour:** Assess the foveal depression. Is it intact, flattened, or elevated? Describe its state.
    *   **Retinal Pigment Epithelium (RPE):** Examine the hyperreflective RPE band. Is it smooth and continuous? Note any signs of detachment or irregularity.
    *   **Outer Retinal Layers:** Comment on the integrity of the outer retinal layers, especially the ellipsoid zone (IS/OS junction), as an indicator of photoreceptor health.
    *   **Choroid:** Describe the choroid and the choroidal-scleral interface. Note any visible granularity or variations.

2.  **Summary Section:**
    *   Provide a concluding summary based on your interpretation above. State the likely condition of the eye (e.g., normal, or showing signs of specific conditions like DME, AMD, etc.).

Analyze the image provided and generate the report. Be descriptive and clinical in your language.

Image: {{media url=photoDataUri}}`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
