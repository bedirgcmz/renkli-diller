import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

export async function createAndSharePdf(html: string, fileName: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: fileName,
    UTI: "com.adobe.pdf",
  });
}
