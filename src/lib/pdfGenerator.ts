import jsPDF from 'jspdf';
import { PaymentRecord, Gym, Member } from '../types/database';
import { formatDate } from './utils';

export function generatePaymentReceiptPDF(payment: PaymentRecord, gym: Gym, member: Member): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Orange Accent Stripe
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 40, pageWidth, 2.5, 'F');

  // Gym Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(gym.name.toUpperCase(), 15, 18);

  // Gym Slogan & Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${gym.address} | Phone: ${gym.phone}`, 15, 26);
  doc.text(`Email: ${gym.email} | GSTIN / Tax: 06AAACA1234F1Z5`, 15, 32);

  // Right Side - "TAX INVOICE / RECEIPT"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(249, 115, 22);
  doc.text('PAYMENT RECEIPT', pageWidth - 15, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt #: ${payment.invoice_number}`, pageWidth - 15, 27, { align: 'right' });
  doc.text(`Date: ${formatDate(payment.payment_date)}`, pageWidth - 15, 33, { align: 'right' });

  // Reset text color for body
  doc.setTextColor(30, 41, 59); // slate-800

  // Two Columns: "Billed To" & "Payment Info"
  const startY = 54;

  // Box 1: Billed To
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(15, startY, 85, 35, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22);
  doc.text('BILLED TO (MEMBER)', 20, startY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(member.full_name, 20, startY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Member ID: ${member.member_code}`, 20, startY + 20);
  doc.text(`Phone: ${member.phone}`, 20, startY + 25);
  doc.text(`Email: ${member.email || 'N/A'}`, 20, startY + 30);

  // Box 2: Payment Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, startY, 85, 35, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22);
  doc.text('TRANSACTION DETAILS', 115, startY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment Mode:`, 115, startY + 14);
  doc.text(`Transaction Ref:`, 115, startY + 20);
  doc.text(`Payment Status:`, 115, startY + 26);
  doc.text(`Valid Until:`, 115, startY + 32);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.payment_method.toUpperCase(), 160, startY + 14);
  doc.text(payment.transaction_id || 'OFFLINE-CONFIRMED', 160, startY + 20);
  
  // Status with badge color
  doc.setTextColor(16, 185, 129); // green
  doc.text(payment.status.toUpperCase(), 160, startY + 26);

  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(member.membership_end_date), 160, startY + 32);

  // Items Table Header
  const tableY = startY + 45;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION', 20, tableY + 5.5);
  doc.text('VALIDITY', 95, tableY + 5.5);
  doc.text('BASE (INR)', 135, tableY + 5.5, { align: 'right' });
  doc.text('GST (18%)', 160, tableY + 5.5, { align: 'right' });
  doc.text('TOTAL', pageWidth - 20, tableY + 5.5, { align: 'right' });

  // Table Row
  const rowY = tableY + 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, rowY, pageWidth - 30, 14, 'D');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const planTitle = payment.membership_plan?.name || 'Gym Membership Subscription';
  doc.text(planTitle, 20, rowY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Full access to gym equipment, lockers, and showers', 20, rowY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`${formatDate(member.membership_start_date)} - ${formatDate(member.membership_end_date)}`, 95, rowY + 8);

  const basePrice = payment.amount || (payment.total_amount / 1.18);
  const tax = payment.tax_amount || (payment.total_amount - basePrice);

  doc.text(`₹${basePrice.toFixed(2)}`, 135, rowY + 8, { align: 'right' });
  doc.text(`₹${tax.toFixed(2)}`, 160, rowY + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(`₹${payment.total_amount.toFixed(2)}`, pageWidth - 20, rowY + 8, { align: 'right' });

  // Totals Breakdown Box (Bottom Right)
  const totalsY = rowY + 22;
  const totalsX = pageWidth - 90;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text('Integrated GST (18%):', totalsX, totalsY + 6);
  doc.text('Discount:', totalsX, totalsY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`₹${basePrice.toFixed(2)}`, pageWidth - 20, totalsY, { align: 'right' });
  doc.text(`₹${tax.toFixed(2)}`, pageWidth - 20, totalsY + 6, { align: 'right' });
  doc.text(`₹0.00`, pageWidth - 20, totalsY + 12, { align: 'right' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, totalsY + 15, pageWidth - 20, totalsY + 15);

  // Grand Total Box
  doc.setFillColor(249, 115, 22);
  doc.rect(totalsX - 5, totalsY + 17, 75, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', totalsX, totalsY + 24);
  doc.text(`₹${payment.total_amount.toFixed(2)}`, pageWidth - 20, totalsY + 24, { align: 'right' });

  // Terms and Signature Box
  const termsY = totalsY + 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS:', 15, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Membership fees are non-refundable and non-transferable.', 15, termsY + 5);
  doc.text('2. Please scan your member QR code at the reception desk for every visit.', 15, termsY + 9);
  doc.text('3. Proper gym attire and clean training shoes are mandatory on the workout floor.', 15, termsY + 13);
  doc.text('4. Aman Sport club reserves the right of admission and membership rules enforcement.', 15, termsY + 17);

  // Signature Block
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 70, termsY + 18, pageWidth - 20, termsY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('AMAN SPORT CLUB', pageWidth - 45, termsY + 23, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory & Stamp', pageWidth - 45, termsY + 27, { align: 'center' });

  // Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 280, pageWidth, 17, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Computer generated receipt • Generated on ${new Date().toLocaleString()} • Aman Sport club SaaS`, pageWidth / 2, 289, { align: 'center' });

  return doc;
}
