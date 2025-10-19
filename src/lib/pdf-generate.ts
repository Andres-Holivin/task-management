import jsPDF from 'jspdf';
import type { Task } from '@/types/task';

export const generateTasksPDF = (tasks: Task[]) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Task Management Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated on: ${timestamp}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const todoCount = tasks.filter(t => t.status === 'TODO').length;
    const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const doneCount = tasks.filter(t => t.status === 'DONE').length;

    pdf.text(`Total Tasks: ${tasks.length}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`To Do: ${todoCount} | In Progress: ${inProgressCount} | Done: ${doneCount}`, margin, yPosition);
    yPosition += 15;

    // Tasks
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tasks', margin, yPosition);
    yPosition += 10;

    tasks.forEach((task, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
        }

        // Task number and title
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${task.title}`, margin, yPosition);
        yPosition += 6;

        // Status badge
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const statusText = `Status: ${task.status.replace('_', ' ')}`;
        pdf.text(statusText, margin + 5, yPosition);
        yPosition += 6;

        // Description
        if (task.description) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            const splitDescription = pdf.splitTextToSize(
                task.description,
                pageWidth - 2 * margin - 10
            );
            pdf.text(splitDescription, margin + 5, yPosition);
            yPosition += splitDescription.length * 5;
        }

        // Created/Updated dates
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        const created = new Date(task.createdAt).toLocaleDateString();
        pdf.text(`Created: ${created}`, margin + 5, yPosition);
        yPosition += 5;
        pdf.setTextColor(0, 0, 0);

        yPosition += 8; // Space between tasks
    });

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
        'Task Manager Dashboard - © 2025',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
    );

    // Save the PDF
    pdf.save(`tasks-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
