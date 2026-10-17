/**
 * Downloads Lubna Akter's official Curriculum Vitae PDF file directly and reliably
 */
export const downloadCvFile = async () => {
  try {
    const response = await fetch('/Lubna_Akter_BPharm_Resume.pdf');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'Lubna_Akter_BPharm_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Error downloading CV PDF, falling back to direct link', err);
    const link = document.createElement('a');
    link.href = '/Lubna_Akter_BPharm_Resume.pdf';
    link.download = 'Lubna_Akter_BPharm_Resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
