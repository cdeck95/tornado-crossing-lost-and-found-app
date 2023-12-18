import { ImageAnnotatorClient } from "@google-cloud/vision";

const client = new ImageAnnotatorClient();

// Call this function with the path of the stored image
export async function detectText(imagePath: string) {
  try {
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;
    if (detections) {
      console.log("Text:");
      detections.forEach((text) => console.log(text.description));
    } else {
      console.log("No text detected");
    }
  } catch (error) {
    console.error("Error during text detection:", error);
  }
}

// export async function detectColor(imagePath: string) {
//   const [result] = await client.imageProperties(imagePath);
//   const colors = result.imagePropertiesAnnotation.dominantColors.colors;
//   colors.forEach((color) => {
//     console.log(
//       `Color ${color.color.red}, ${color.color.green}, ${color.color.blue}`
//     );
//   });
// }
