const fs = require('fs').promises;
const path = require('path');

// Função para verificar se o arquivo PDF ainda existe
export async function verificationPdfExist(id: string) {
    // Caminho para o arquivo PDF
    const caminhoPDF = `src/modules/PDFS/${id}.pdf`;

    try {
        // Verifica se o arquivo PDF ainda existe
        await fs.access(caminhoPDF, fs.constants.F_OK);
        return true
    } catch (error) {
        return false
    }
}
