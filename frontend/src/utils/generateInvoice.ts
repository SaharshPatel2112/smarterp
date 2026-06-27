import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface InvoiceItem {
  name: string;
  unit: string;
  qty: number;
  rate: number;
  gst_rate: number;
  amount: number;
}

interface InvoiceData {
  voucher_no: string;
  voucher_date: string;
  company_name: string;
  company_gstin?: string;
  company_address?: string;
  customer_name: string;
  customer_gstin?: string;
  customer_phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  gst_amount: number;
  total_amount: number;
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const blue = rgb(0.15, 0.39, 0.92);
  const dark = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.95, 0.95, 0.95);
  const white = rgb(1, 1, 1);

  let y = height - 40;

  // Header background
  page.drawRectangle({ x: 0, y: y - 70, width, height: 110, color: blue });

  // Company name
  page.drawText(invoice.company_name.toUpperCase(), {
    x: 40,
    y: y + 30,
    size: 18,
    font: fontBold,
    color: white,
  });

  // TAX INVOICE label
  page.drawText("TAX INVOICE", {
    x: width - 140,
    y: y + 30,
    size: 14,
    font: fontBold,
    color: white,
  });

  if (invoice.company_gstin) {
    page.drawText(`GSTIN: ${invoice.company_gstin}`, {
      x: 40,
      y: y + 10,
      size: 9,
      font: fontRegular,
      color: white,
    });
  }

  if (invoice.company_address) {
    page.drawText(invoice.company_address, {
      x: 40,
      y: y - 8,
      size: 9,
      font: fontRegular,
      color: white,
    });
  }

  y -= 80;

  // Invoice meta box
  page.drawRectangle({ x: 0, y: y - 55, width, height: 58, color: lightGray });

  page.drawText("Invoice No:", {
    x: 40,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText(invoice.voucher_no, {
    x: 110,
    y: y - 15,
    size: 9,
    font: fontRegular,
    color: dark,
  });

  page.drawText("Date:", {
    x: 40,
    y: y - 32,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText(new Date(invoice.voucher_date).toLocaleDateString("en-IN"), {
    x: 110,
    y: y - 32,
    size: 9,
    font: fontRegular,
    color: dark,
  });

  // Customer info on right
  page.drawText("Bill To:", {
    x: 320,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText(invoice.customer_name, {
    x: 320,
    y: y - 24,
    size: 10,
    font: fontBold,
    color: dark,
  });

  if (invoice.customer_phone) {
    page.drawText(`Ph: ${invoice.customer_phone}`, {
      x: 320,
      y: y - 38,
      size: 9,
      font: fontRegular,
      color: gray,
    });
  }

  if (invoice.customer_gstin) {
    page.drawText(`GSTIN: ${invoice.customer_gstin}`, {
      x: 320,
      y: y - 51,
      size: 9,
      font: fontRegular,
      color: gray,
    });
  }

  y -= 75;

  // Table header
  page.drawRectangle({
    x: 40,
    y: y - 22,
    width: width - 80,
    height: 24,
    color: blue,
  });

  const cols = {
    no: 40,
    name: 60,
    unit: 240,
    qty: 285,
    rate: 340,
    gst: 415,
    amount: 480,
  };

  page.drawText("#", {
    x: cols.no + 2,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("Item Name", {
    x: cols.name,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("Unit", {
    x: cols.unit,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("Qty", {
    x: cols.qty,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("Rate", {
    x: cols.rate,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("GST%", {
    x: cols.gst,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });
  page.drawText("Amount", {
    x: cols.amount,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: white,
  });

  y -= 30;

  // Table rows
  invoice.items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      page.drawRectangle({
        x: 40,
        y: y - 8,
        width: width - 80,
        height: 22,
        color: rgb(0.98, 0.98, 0.98),
      });
    }
    const rowY = y + 5;
    page.drawText(String(idx + 1), {
      x: cols.no + 2,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(item.name.slice(0, 28), {
      x: cols.name,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(item.unit, {
      x: cols.unit,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(String(item.qty), {
      x: cols.qty,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(`${item.rate.toFixed(2)}`, {
      x: cols.rate,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(`${item.gst_rate}%`, {
      x: cols.gst,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    page.drawText(`${item.amount.toFixed(2)}`, {
      x: cols.amount,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: dark,
    });
    y -= 22;
  });

  y -= 10;

  // Totals section
  const totalsX = 360;

  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 18;

  page.drawText("Subtotal:", {
    x: totalsX,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`Rs. ${invoice.subtotal.toFixed(2)}`, {
    x: 480,
    y,
    size: 9,
    font: fontRegular,
    color: dark,
  });
  y -= 16;

  const cgst = invoice.gst_amount / 2;
  const sgst = invoice.gst_amount / 2;

  page.drawText("CGST:", {
    x: totalsX,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`Rs. ${cgst.toFixed(2)}`, {
    x: 480,
    y,
    size: 9,
    font: fontRegular,
    color: dark,
  });
  y -= 16;

  page.drawText("SGST:", {
    x: totalsX,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`Rs. ${sgst.toFixed(2)}`, {
    x: 480,
    y,
    size: 9,
    font: fontRegular,
    color: dark,
  });
  y -= 16;

  page.drawLine({
    start: { x: totalsX, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 18;

  page.drawRectangle({
    x: totalsX - 8,
    y: y - 6,
    width: width - totalsX - 32,
    height: 22,
    color: blue,
  });
  page.drawText("TOTAL:", {
    x: totalsX,
    y,
    size: 10,
    font: fontBold,
    color: white,
  });
  page.drawText(`Rs. ${invoice.total_amount.toFixed(2)}`, {
    x: 480,
    y,
    size: 10,
    font: fontBold,
    color: white,
  });

  y -= 50;

  // Footer
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 16;
  page.drawText("Thank you for your business!", {
    x: 40,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText("This is a computer generated invoice.", {
    x: width - 220,
    y,
    size: 8,
    font: fontRegular,
    color: gray,
  });

  // Save and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.voucher_no}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
