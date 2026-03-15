import { shareAsync } from "expo-sharing";
import * as RNHTMLtoPDF from "react-native-html-to-pdf";

export async function createPdf(html: string, fileName: string) {
  const { filePath } = await RNHTMLtoPDF.generatePDF({ html, fileName });
  return filePath;
}

export async function sharePdf(filePath: string) {
  await shareAsync(filePath, { mimeType: "application/pdf" });
}
