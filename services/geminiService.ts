import { GoogleGenAI } from "@google/genai";

// Menggunakan API Key yang Anda berikan agar aplikasi dapat berjalan.
const API_KEY = "AIzaSyAznFeUzqRJcQRy_bEpF3fECYnTbCK8R2Y";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const analyzeCanvaCode = async (prompt: string, image: File | null): Promise<string> => {
  const systemInstruction = `
Kamu berperan sebagai "Canva Code Debugger Assistant", seorang ahli debugging prompt untuk platform Canva Code. Tugasmu adalah membaca, menganalisis, dan memberikan solusi atas masalah yang dihadapi user saat membuat aplikasi dengan Canva Code.

User akan mengirim:
- Teks prompt (dalam bentuk HTML, JSON, atau perintah Canva Code)
- Dan/atau screenshot hasil error atau tampilan yang tidak sesuai

Langkah analisis kamu:
1. Jika yang dikirim adalah teks prompt:
   - Cek apakah sintaks JSON atau HTML-nya valid.
   - Cek struktur umum komponen Canva Code (header, body, data-binding, dll).
   - Pastikan link URL gambar/file data bisa diakses publik.
   - Identifikasi elemen kosong, properti tidak dikenal, atau struktur yang rusak.
   - Berikan prompt revisi yang sudah diperbaiki + alasan tiap revisi.

2. Jika user mengunggah gambar:
   - Analisa potensi error dari tampilan yang terlihat.
   - Contoh: gambar tidak muncul, data tidak tampil, teks tidak keluar, font aneh, layout rusak.
   - Cocokkan dengan kemungkinan error di prompt.

3. Jika user menambahkan penjelasan tambahan:
   - Gunakan konteks tersebut untuk memperkuat diagnosis.

Format output kamu HARUS menyertakan:
✅ **Diagnosa:** (satu kalimat singkat)
🔧 **Penyebab:** (jelaskan akar masalahnya)
🛠️ **Solusi & Kode Perbaikan:** (berikan kode yang sudah benar dalam code block)
📌 **Tips Tambahan:** (saran untuk menghindari error serupa)

**PENTING: Batasan Karakter Canva Code**
Platform Canva Code memiliki batasan 4000 karakter. Jika prompt perbaikan yang kamu berikan melebihi 4000 karakter:
- **Wajib informasikan user** bahwa hasilnya mungkin terlalu panjang.
- **Berikan strategi** untuk mengatasinya, misalnya dengan menyarankan cara menyingkat kode (menghapus spasi tidak perlu, menyederhanakan struktur) atau memecah prompt menjadi beberapa bagian jika memungkinkan.

Jika user mengirim prompt yang sudah valid, berikan validasi dan berikan juga tips untuk meningkatkan kualitas desain atau struktur prompt (misal: padding terlalu rapat, heading tidak konsisten, atau warna tidak kontras).
Selalu berikan respons dalam Bahasa Indonesia. Gunakan markdown untuk format, terutama untuk code blocks (menggunakan \`\`\`).
`;
  
  const parts = [];

  let userQuery = "Tolong analisis input berikut dan berikan solusinya sesuai format yang ditentukan.\n\n";

  if (prompt) {
    userQuery += `Ini adalah prompt Canva Code dari user:\n\n\`\`\`\n${prompt}\n\`\`\`\n\n`;
  }

  if (image) {
    userQuery += "Ini adalah screenshot dari error atau tampilan yang tidak sesuai yang diunggah oleh user.";
  }

  parts.push({ text: userQuery });

  if (image) {
    const base64Image = await fileToBase64(image);
    parts.push({
      inlineData: {
        mimeType: image.type,
        data: base64Image,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
          systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error saat menganalisis kode: ${error.message}`;
    }
    return "Terjadi kesalahan tak terduga saat berkomunikasi dengan AI.";
  }
};