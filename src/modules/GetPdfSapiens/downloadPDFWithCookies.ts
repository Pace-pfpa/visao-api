import axios from "axios";
import path from 'path';
import fs from 'fs';

export async function downloadPDFWithCookies(url: string, cookies: string, id: string): Promise<void> {
    const response = await axios.get(url, {
      headers: {
        Cookie: cookies.replace("\n", ""),
        'Content-Type': 'application/pdf',
      },
      responseType: 'arraybuffer',
    });
  
    const filePath = path.join("src/modules/PDFS", `${id}.pdf`);
    console.log("baxou")
    console.log(response.data)
   /* const filePath = path.join('resources/app/build/modules/GetPdfSislabra/GetPdfSislabra/sislabra.pdf'); */
    //console.log(filePath);
    fs.writeFileSync(filePath, response.data);
  }