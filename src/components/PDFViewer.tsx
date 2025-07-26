import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  url: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, className }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("flex flex-col bg-background rounded-lg border shadow-sm", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            PDF Viewer
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Content */}
      <div className="flex-1 min-h-[1000px]">
        <iframe
          src={url}
          title="PDF preview"
          className="w-full h-[1000px] border-0 rounded-b-lg"
          onError={() => {
            console.error('Failed to load PDF in iframe');
          }}
        />
      </div>
    </div>
  );
};