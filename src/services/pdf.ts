import { shareAsync } from "expo-sharing";
import * as RNHTMLtoPDF from "react-native-html-to-pdf";

export async function createPdf(html: string, fileName: string): Promise<string> {
  const file = await RNHTMLtoPDF.generatePDF({ html, fileName, directory: "Documents" });
  if (!file.filePath) throw new Error("PDF generation failed");
  return file.filePath;
}

export async function sharePdf(filePath: string): Promise<void> {
  const uri = filePath.startsWith("file://") ? filePath : `file://${filePath}`;
  await shareAsync(uri, { mimeType: "application/pdf" });
}
