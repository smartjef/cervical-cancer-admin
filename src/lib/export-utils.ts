
export function exportToCSV(data: any[], filename: string, columns: { key: string; label: string }[]) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Helper to get nested properties safely
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    // Create CSV header
    const headers = columns.map(col => `"${col.label}"`).join(',');

    // Create CSV rows
    const rows = data.map(row => {
        return columns.map(col => {
            const value = getNestedValue(row, col.key);
            // Handle null/undefined
            if (value === null || value === undefined) return '""';

            // Handle strings (escape quotes)
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',');
    });

    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Set filename with date if not provided
    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
