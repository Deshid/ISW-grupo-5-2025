import PDFDocument from "pdfkit";
import fs from "fs";

// data: array de objetos reclamo, path: ruta donde guardar el PDF
export async function exportReclamosToPDF(data, path) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        const stream = fs.createWriteStream(path);
        doc.pipe(stream);

        doc.fontSize(18).text("Listado de Reclamos", { align: "center" });
        doc.moveDown();

        // Encabezados
        doc.fontSize(12).text("ID", 50, doc.y, { continued: true })
            .text("Descripción", 100, doc.y, { continued: true })
            .text("Categoría", 300, doc.y, { continued: true })
            .text("Estado", 400, doc.y, { continued: true })
            .text("Fecha", 480, doc.y);
        doc.moveDown();

        // Filas
        data.forEach(r => {
            doc.text(String(r.id), 50, doc.y, { continued: true })
                .text(r.descripcion, 100, doc.y, { continued: true })
                .text(r.categoria, 300, doc.y, { continued: true })
                .text(r.estado, 400, doc.y, { continued: true })
                .text(r.fecha, 480, doc.y);
            doc.moveDown();
        });

        doc.end();

        stream.on("finish", () => resolve(path));
        stream.on("error", reject);
    });
}