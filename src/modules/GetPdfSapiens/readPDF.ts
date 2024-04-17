import fs from 'fs';
import PDFParser from 'pdf-parse';

// Função para ler o arquivo PDF e retornar o conteúdo em JSON
export async function readPDF(id: string): Promise<any> {
  // Lê o arquivo PDF
  
  const pdfBuffer = fs.readFileSync(`src/modules/PDFS/${id}.pdf`);

  // Utiliza a biblioteca PDFParser para converter o buffer em JSON
  const pdfData = await PDFParser(pdfBuffer);
  
  return pdfData.text;
}