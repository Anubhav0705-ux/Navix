import { jsPDF } from 'jspdf';
import { TripPlanResult } from '@/types';

export function exportTripPlanPDF(plan: TripPlanResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cb = plan.cost_breakdown;
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = 0;

  // Helper: check page space and add page with margin reset if needed
  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  // ============================================================================
  // 1. EXECUTIVE HEADER BANNER (Deep Ink & Teal Accent)
  // ============================================================================
  doc.setFillColor(20, 42, 56); // #142A38 Ink
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(31, 110, 120); // #1F6E78 Teal
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  // Logo & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('NAVIX', margin, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(216, 166, 75); // #D8A64B Ochre Gold
  doc.text('TRAVEL COMMAND DOSSIER', margin + 28, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Deterministic Multi-Modal Routing & Constrained Budget Execution Plan', margin + 28, 16);

  // Reference & Date on Right
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  const genDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Generated: ${genDate}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Origin City: ${plan.origin}`, pageWidth - margin, 17, { align: 'right' });

  y = 38;

  // ============================================================================
  // 2. JOURNEY OVERVIEW HERO
  // ============================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 42, 56);
  doc.text(`${plan.origin}   ->   ${plan.destination}`, margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Dates: ${plan.departure_date} to ${plan.return_date}   •   ${plan.days} Days / ${plan.nights} Nights   •   ${plan.travellers} Traveler${plan.travellers > 1 ? 's' : ''}`,
    margin,
    y
  );
  y += 10;

  // ============================================================================
  // 3. FINANCIAL BUDGET AUDIT LEDGER
  // ============================================================================
  const ledgerHeight = 38;
  doc.setFillColor(251, 247, 241); // #FBF7F1 Warm Cream
  doc.roundedRect(margin, y, contentWidth, ledgerHeight, 3, 3, 'F');
  doc.setDrawColor(235, 220, 199); // #EBDCC7 Border
  doc.roundedRect(margin, y, contentWidth, ledgerHeight, 3, 3, 'S');

  // Ledger Title Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(31, 110, 120);
  doc.text('FINANCIAL BUDGET AUDIT & ALLOCATION', margin + 4, y + 7);

  // Left Column: Total Budget vs Actual
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 42, 56);
  doc.text(`Total Planned Spend:`, margin + 4, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${cb.total_trip_cost.toLocaleString()}`, margin + 42, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Maximum User Budget:`, margin + 4, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${cb.maximum_budget.toLocaleString()}`, margin + 42, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Remaining Balance:`, margin + 4, y + 28);
  doc.setFont('helvetica', 'bold');
  const surplusColor = cb.remaining_budget >= 0 ? [40, 140, 120] : [220, 40, 40];
  doc.setTextColor(surplusColor[0], surplusColor[1], surplusColor[2]);
  doc.text(`INR ${cb.remaining_budget.toLocaleString()} (${cb.budget_status})`, margin + 42, y + 28);

  // Right Column: Breakdown Categories
  const colRightX = margin + 96;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);

  doc.text(`• Transit Fare:`, colRightX, y + 12);
  doc.text(`INR ${cb.transport_cost.toLocaleString()}`, colRightX + 48, y + 12, { align: 'right' });

  doc.text(`• Lodging (${plan.stay?.tier || 'Standard'}):`, colRightX, y + 17);
  doc.text(`INR ${cb.accommodation_cost.toLocaleString()}`, colRightX + 48, y + 17, { align: 'right' });

  doc.text(`• Dining (${plan.food?.tier || 'Authentic'}):`, colRightX, y + 22);
  doc.text(`INR ${cb.food_cost.toLocaleString()}`, colRightX + 48, y + 22, { align: 'right' });

  doc.text(`• Activities:`, colRightX, y + 27);
  doc.text(`INR ${cb.activities_cost.toLocaleString()}`, colRightX + 48, y + 27, { align: 'right' });

  doc.text(`• Contingency Reserve (8%):`, colRightX, y + 32);
  doc.text(`INR ${cb.contingency_buffer.toLocaleString()}`, colRightX + 48, y + 32, { align: 'right' });

  y += ledgerHeight + 10;

  // ============================================================================
  // 4. MULTI-MODAL TRANSIT BLUEPRINT
  // ============================================================================
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 42, 56);
  doc.text('MULTI-MODAL TRANSIT BLUEPRINT', margin, y);

  // Accent Line under Section Title
  doc.setDrawColor(31, 110, 120);
  doc.line(margin, y + 2, margin + 45, y + 2);
  y += 7;

  // Segments Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SEGMENT / ROUTE', margin + 2, y + 4.2);
  doc.text('OPERATOR / SERVICE', margin + 70, y + 4.2);
  doc.text('DEPARTURE / ARRIVAL', margin + 120, y + 4.2);
  doc.text('FARE', pageWidth - margin - 2, y + 4.2, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (plan.route_segments && plan.route_segments.length > 0) {
    plan.route_segments.forEach((seg, idx) => {
      ensureSpace(12);
      const isOdd = idx % 2 === 1;
      if (isOdd) {
        doc.setFillColor(251, 247, 241);
        doc.rect(margin, y - 1, contentWidth, 9, 'F');
      }

      // Mode badge and Route
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 110, 120);
      doc.text(`[${seg.transport_mode}]`, margin + 2, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 42, 56);
      const routeText = `${seg.source_city} (${seg.source_node_name}) -> ${seg.dest_city} (${seg.dest_node_name})`;
      const truncatedRoute = routeText.length > 36 ? routeText.substring(0, 34) + '...' : routeText;
      doc.text(truncatedRoute, margin + 16, y + 3);

      // Operator
      doc.setTextColor(100, 116, 139);
      doc.text(seg.provider || 'Scheduled Transit', margin + 70, y + 3);

      // Dep / Arr Timing
      const depT = seg.departure_time ? String(seg.departure_time).substring(11, 16) || String(seg.departure_time) : '06:00';
      const arrT = seg.arrival_time ? String(seg.arrival_time).substring(11, 16) || String(seg.arrival_time) : '18:00';
      doc.text(`${depT} - ${arrT} (${Math.floor(seg.duration_minutes / 60)}h ${seg.duration_minutes % 60}m)`, margin + 120, y + 3);

      // Fare
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 42, 56);
      doc.text(`INR ${seg.cost}`, pageWidth - margin - 2, y + 3, { align: 'right' });

      y += 9;
    });
  } else {
    doc.text('Direct transfer route scheduled.', margin + 2, y + 3);
    y += 8;
  }

  y += 6;

  // ============================================================================
  // 5. STAY & DINING BLUEPRINT
  // ============================================================================
  ensureSpace(28);
  const infoBoxWidth = (contentWidth - 6) / 2;

  // Lodging Card
  doc.setFillColor(251, 247, 241);
  doc.roundedRect(margin, y, infoBoxWidth, 24, 2, 2, 'F');
  doc.setDrawColor(235, 220, 199);
  doc.roundedRect(margin, y, infoBoxWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 110, 120);
  doc.text('HOTEL & LODGING PLAN', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 42, 56);
  doc.text(`Venue: ${plan.stay?.name || 'Curated Accommodation'}`, margin + 4, y + 11);
  doc.text(`Tier: ${plan.stay?.tier || 'Standard'}   •   Nights: ${plan.stay?.nights || plan.nights}`, margin + 4, y + 16);
  doc.text(`Total Lodging Spend: INR ${(plan.stay?.total_cost || cb.accommodation_cost).toLocaleString()}`, margin + 4, y + 21);

  // Dining Card
  doc.setFillColor(251, 247, 241);
  doc.roundedRect(margin + infoBoxWidth + 6, y, infoBoxWidth, 24, 2, 2, 'F');
  doc.setDrawColor(235, 220, 199);
  doc.roundedRect(margin + infoBoxWidth + 6, y, infoBoxWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 110, 120);
  doc.text('REGIONAL DINING PLAN', margin + infoBoxWidth + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(20, 42, 56);
  doc.text(`Preference: ${plan.food?.name || plan.food?.tier || 'Regional Specialities'}`, margin + infoBoxWidth + 10, y + 11);
  doc.text(`Tier: ${plan.food?.tier || 'Authentic'}   •   Days: ${plan.food?.days || plan.days}`, margin + infoBoxWidth + 10, y + 16);
  doc.text(`Total Dining Spend: INR ${(plan.food?.total_cost || cb.food_cost).toLocaleString()}`, margin + infoBoxWidth + 10, y + 21);

  y += 32;

  // ============================================================================
  // 6. DAY-BY-DAY FIELD ITINERARY
  // ============================================================================
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 42, 56);
  doc.text('AUTOMATIC DAY-BY-DAY ITINERARY', margin, y);

  doc.setDrawColor(31, 110, 120);
  doc.line(margin, y + 2, margin + 50, y + 2);
  y += 8;

  if (plan.daily_itinerary && plan.daily_itinerary.length > 0) {
    plan.daily_itinerary.forEach((day) => {
      ensureSpace(22);

      // Day Title Pill
      doc.setFillColor(31, 110, 120);
      doc.roundedRect(margin, y, contentWidth, 6.5, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `Day ${day.day_number}: ${day.title}   •   Est. Daily Spend: INR ${day.estimated_daily_spend.toLocaleString()}`,
        margin + 4,
        y + 4.5
      );
      y += 9.5;

      // Structured Events
      if (day.structured_events && day.structured_events.length > 0) {
        day.structured_events.forEach((ev) => {
          ensureSpace(12);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(31, 110, 120);
          doc.text(`[${ev.start_time} - ${ev.end_time}]`, margin + 3, y);

          doc.setTextColor(20, 42, 56);
          doc.text(ev.title, margin + 32, y);

          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);

          const descLines = doc.splitTextToSize(ev.description || '', contentWidth - 36);
          descLines.forEach((line: string) => {
            ensureSpace(5);
            doc.text(line, margin + 32, y);
            y += 3.5;
          });
          y += 2;
        });
      } else if (day.events && day.events.length > 0) {
        day.events.forEach((evt) => {
          ensureSpace(8);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);

          const eventLines = doc.splitTextToSize(`• ${evt}`, contentWidth - 8);
          eventLines.forEach((line: string) => {
            doc.text(line, margin + 4, y);
            y += 4;
          });
        });
      }
      y += 4;
    });
  }

  // ============================================================================
  // 7. ALGORITHMIC DECISION RATIONALE
  // ============================================================================
  if (plan.decision_explanations && plan.decision_explanations.length > 0) {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 42, 56);
    doc.text('ALGORITHMIC DECISION RATIONALE', margin, y);
    doc.setDrawColor(31, 110, 120);
    doc.line(margin, y + 2, margin + 45, y + 2);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    plan.decision_explanations.forEach((exp) => {
      ensureSpace(8);
      const lines = doc.splitTextToSize(`• ${exp}`, contentWidth - 4);
      lines.forEach((line: string) => {
        doc.text(line, margin + 2, y);
        y += 3.5;
      });
    });
  }

  // ============================================================================
  // 8. RUNNING FOOTERS ON ALL PAGES
  // ============================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(235, 220, 199);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('NAVIX Algorithmic Travel Platform   •   Deterministic Budget & Multi-Modal Routing Engine', margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Generate safe filename and trigger download
  const safeOrigin = (plan.origin || 'origin').replace(/[^a-zA-Z0-9]/g, '_');
  const safeDest = (plan.destination || 'destination').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `NAVIX_${safeOrigin}_to_${safeDest}_Itinerary.pdf`;
  doc.save(filename);
}
