import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CSVRow {
  id: string;
  date: string;
  description: string;
  merchant: string;
  amount: string;
  currency: string;
  type: 'debit' | 'credit';
  category: string;
  valid: boolean;
  error?: string;
}

export function ImportTransactions() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [importSummary, setImportSummary] = useState({
    total: 0,
    credits: 0,
    debits: 0,
    dateRange: { start: '', end: '' }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accounts = [
    { id: '1', name: 'Savings Account', type: 'savings' },
    { id: '2', name: 'Checking Account', type: 'checking' },
    { id: '3', name: 'Credit Card', type: 'credit' }
  ];

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Income',
    'Other'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim());
      
      // Skip header row
      const dataRows = rows.slice(1);
      
      const parsedData: CSVRow[] = dataRows.map((row, index) => {
        const columns = row.split(',').map(col => col.trim());
        
        // Basic validation
        const date = columns[0] || '';
        const amount = columns[3] || '0';
        const isValid = date.match(/\d{4}-\d{2}-\d{2}/) !== null && !isNaN(parseFloat(amount));
        
        return {
          id: `row-${index}`,
          date: columns[0] || '',
          description: columns[1] || '',
          merchant: columns[2] || '',
          amount: columns[3] || '',
          currency: columns[4] || 'INR',
          type: parseFloat(amount) < 0 ? 'debit' : 'credit',
          category: columns[5] || 'Other',
          valid: isValid,
          error: isValid ? undefined : 'Invalid date or amount format'
        };
      });
      
      setCsvData(parsedData);
      setIsValidated(false);
      setIsImported(false);
      toast.success('CSV file loaded successfully');
    };
    
    reader.readAsText(file);
  };

  const handleValidate = () => {
    if (!selectedAccount) {
      toast.error('Please select a target account');
      return;
    }

    const invalidRows = csvData.filter(row => !row.valid);
    
    if (invalidRows.length > 0) {
      toast.error(`${invalidRows.length} rows have validation errors`);
      return;
    }

    setIsValidated(true);
    toast.success('CSV validated successfully! Ready to import.');
  };

  const handleImport = () => {
    if (!isValidated) {
      toast.error('Please validate the CSV first');
      return;
    }

    // Calculate summary
    const credits = csvData.filter(row => row.type === 'credit');
    const debits = csvData.filter(row => row.type === 'debit');
    
    const dates = csvData.map(row => new Date(row.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0]?.toLocaleDateString('en-IN') || '';
    const endDate = dates[dates.length - 1]?.toLocaleDateString('en-IN') || '';

    setImportSummary({
      total: csvData.length,
      credits: credits.length,
      debits: debits.length,
      dateRange: { start: startDate, end: endDate }
    });

    setIsImported(true);
    toast.success('Transactions imported successfully!');
  };

  const handleCategoryChange = (rowId: string, category: string) => {
    setCsvData(prev => prev.map(row => 
      row.id === rowId ? { ...row, category } : row
    ));
  };

  const handleReset = () => {
    setFile(null);
    setSelectedAccount('');
    setCsvData([]);
    setIsValidated(false);
    setIsImported(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Import Transactions</h1>
        <p className="text-muted-foreground">Upload CSV files to add transactions to your account</p>
      </div>

      {/* Upload Section */}
      {!isImported && (
        <Card>
          <CardHeader>
            <CardTitle>CSV Upload</CardTitle>
            <CardDescription>Drag and drop your CSV file or browse to upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${file ? 'bg-green-100' : 'bg-primary/10'}`}>
                  {file ? (
                    <FileText className="h-8 w-8 text-green-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
                
                {file ? (
                  <div>
                    <p className="font-medium text-lg mb-1">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-lg mb-1">Drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>✓ Accepted format: .csv</span>
                  <span>✓ Max file size: 5MB</span>
                </div>
              </div>
            </div>

            {/* Account Mapping */}
            {file && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Account *</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account to import to" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Currency will be auto-detected from CSV (default: INR)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Preview Table */}
      {csvData.length > 0 && !isImported && (
        <Card>
          <CardHeader>
            <CardTitle>CSV Preview</CardTitle>
            <CardDescription>Review and edit transactions before importing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Merchant</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row) => (
                    <tr 
                      key={row.id} 
                      className={`border-b ${!row.valid ? 'bg-red-50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        {row.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{row.date}</td>
                      <td className="py-3 px-4 text-sm">{row.description}</td>
                      <td className="py-3 px-4 text-sm">{row.merchant}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        ₹{Math.abs(parseFloat(row.amount)).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.type === 'credit' ? 'default' : 'secondary'}>
                          {row.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Select 
                          value={row.category} 
                          onValueChange={(value) => handleCategoryChange(row.id, value)}
                        >
                          <SelectTrigger className="w-[180px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <div className="flex gap-3">
                {!isValidated ? (
                  <Button onClick={handleValidate}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Validate CSV
                  </Button>
                ) : (
                  <Button onClick={handleImport} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Import Transactions
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Summary */}
      {isImported && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-900">Import Successful!</CardTitle>
                <CardDescription className="text-green-700">
                  Your transactions have been imported successfully
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-semibold">{importSummary.total}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Credits</p>
                <p className="text-2xl font-semibold text-green-600">{importSummary.credits}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Debits</p>
                <p className="text-2xl font-semibold text-red-600">{importSummary.debits}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Date Range</p>
                <p className="text-sm font-medium">{importSummary.dateRange.start}</p>
                <p className="text-sm font-medium">to {importSummary.dateRange.end}</p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleReset}>
                Import Another File
              </Button>
              <Button onClick={() => window.location.reload()}>
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
