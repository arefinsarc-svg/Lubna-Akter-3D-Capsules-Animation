from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf():
    pdf_path = "public/Lubna_Akter_BPharm_Resume.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1e1b4b'),
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#6b21a8'),
        fontName='Helvetica-Bold'
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#4b5563'),
        fontName='Helvetica'
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#4c1d95'),
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1f2937'),
        fontName='Helvetica'
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#374151'),
        fontName='Helvetica',
        leftIndent=10
    )

    story = []

    # Header
    story.append(Paragraph("Lubna Akter", title_style))
    story.append(Paragraph("B.Pharm Student | Pharmaceutical Research, Drug Information & Medical Writing", subtitle_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("+88 0133 95 91 307  |  heyitslubnaakter@gmail.com  |  linkedin.com/in/heyitslubnaakter  |  Gulshan, Vatara, Dhaka, Bangladesh", meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=5, spaceAfter=6))

    # Summary
    story.append(Paragraph("Professional Summary", heading_style))
    summary_text = "4th-Year B.Pharm student with hands-on exposure to pharmacology, drug information analysis, laboratory-based pharmaceutical research, medical writing, and healthcare content development. Skilled in literature review, data interpretation, quality-focused documentation, and collaborative work, with strong attention to detail. Seeking an entry-level opportunity in pharmaceutical research, drug information, or healthcare communication to apply analytical and scientific communication skills."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 3))

    # Education
    story.append(Paragraph("Educational Qualification", heading_style))
    edu_data = [
        [Paragraph("<b>Bachelor of Pharmacy (B. Pharm)</b><br/>University of Information Technology & Sciences (UITS)", body_style), Paragraph("<b>2022 - Present</b><br/>CGPA: 3.37 / 4.00", body_style)],
        [Paragraph("<b>Higher Secondary Certificate (Science)</b><br/>Govt. Kalachandpur High School and College", body_style), Paragraph("<b>2019 - 2022</b><br/>GPA: 5.00 / 5.00", body_style)],
        [Paragraph("<b>Secondary School Certificate (Science)</b><br/>Khilbarirtek Islamia High School", body_style), Paragraph("<b>2017 - 2019</b><br/>GPA: 4.56 / 5.00", body_style)]
    ]
    t_edu = Table(edu_data, colWidths=[380, 160])
    t_edu.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_edu)
    story.append(Spacer(1, 3))

    # Experience
    story.append(Paragraph("Work Experience", heading_style))
    story.append(Paragraph("<b>Co-Founder | Neymat Home Décor</b> (04/2026 - Present | Dhaka, Bangladesh)", subtitle_style))
    story.append(Paragraph("• Co-founded an early-stage home décor brand, building it from the ground up primarily through social media-based sales and marketing.", bullet_style))
    story.append(Paragraph("• Grew order volume by nearly 20% since launch by managing sourcing, inventory, and customer engagement end-to-end.", bullet_style))
    story.append(Spacer(1, 2))

    story.append(Paragraph("<b>Education Byte Builder | Pharma Insights</b> (01/2026 - 02/2026 | Dhaka, Bangladesh)", subtitle_style))
    story.append(Paragraph("• Produced research-backed content that strengthened platform credibility and simplified complex pharma concepts.", bullet_style))
    story.append(Paragraph("• Researched pharmacy and healthcare topics to ensure content accuracy and supported structured editorial planning.", bullet_style))
    story.append(Spacer(1, 2))

    story.append(Paragraph("<b>Branch In-Charge | Emaan</b> (05/2023 - 07/2023 | Dhaka, Bangladesh)", subtitle_style))
    story.append(Paragraph("• Promoted to Branch In-Charge within one month for performance; grew branch sales by up to 20%.", bullet_style))
    story.append(Paragraph("• Managed daily branch operations, supervised sales team performance, and boosted customer retention.", bullet_style))
    story.append(Spacer(1, 3))

    # Research
    story.append(Paragraph("Academic Research Projects", heading_style))
    story.append(Paragraph("<b>Evaluation of Anti-Inflammatory Activity of Commelina erecta Extracts</b> (Co-Researcher | Ongoing)", subtitle_style))
    story.append(Paragraph("• Evaluated anti-inflammatory activity of methanolic and ethanolic Commelina erecta extracts using protein denaturation and HRBC membrane stabilization assays.", bullet_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>Comparative Efficacy of Entecavir vs. Lamivudine in Chronic Hepatitis B</b> (Co-Author | Poster Presentation)", subtitle_style))
    story.append(Paragraph("• Compared antiviral efficacy of Entecavir and Lamivudine in chronic Hepatitis B with emphasis on public health relevance in Bangladesh.", bullet_style))
    story.append(Spacer(1, 3))

    # Skills & Expertise
    story.append(Paragraph("Skills & Expertise", heading_style))
    story.append(Paragraph("<b>Pharmaceutical Knowledge:</b> Pharmacology, Medicinal Chemistry, Pharmaceutical Analysis, Quality Control, Pharmaceutical Technology, Pharmacognosy, Microbiology, Biopharmaceutics, Clinical Pharmacy, Hospital Pharmacy, Regulatory Affairs, Toxicology, Pharmaceutical Biotechnology", body_style))
    story.append(Paragraph("<b>Professional Strengths:</b> Pharmaceutical Research, Laboratory Techniques, Drug Information Analysis, Quality Control Awareness, Regulatory Compliance, Scientific Writing, Critical Thinking, Attention to Detail, Problem Solving, Team Collaboration, Time Management, Adaptability", body_style))
    story.append(Paragraph("<b>Tools & Research Support:</b> Microsoft Word, Excel, PowerPoint, PubMed, Google Scholar, Mendeley, SPSS, Literature Search, Statistical Analysis Support, ChemDraw", body_style))
    story.append(Spacer(1, 3))

    # References
    story.append(Paragraph("References", heading_style))
    story.append(Paragraph("<b>Dr. Md. Mofazzal Hossain</b><br/>Associate Professor & Head, PhD in Medicinal Chemistry<br/>University of Information Technology & Sciences (UITS)<br/>Phone: +880 9678008487 Ext-309 | Email: mofazzal.hossain@uits.ac.bd", body_style))

    doc.build(story)
    print("PDF generated successfully at public/Lubna_Akter_BPharm_Resume.pdf")

if __name__ == '__main__':
    generate_pdf()
