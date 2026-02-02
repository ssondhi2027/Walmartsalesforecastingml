import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
  fileName?: string;
  onClear?: () => void;
}

export function FileUpload({ onFileUpload, fileName, onClear }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim();
          });
          return obj;
        });
        
        onFileUpload(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed">
      {!fileName ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-medium mb-1">Upload your sales data</p>
            <p className="text-sm text-gray-500">CSV file with historical weekly sales data</p>
          </div>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button asChild>
              <span>Choose File</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-gray-500">File uploaded successfully</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
