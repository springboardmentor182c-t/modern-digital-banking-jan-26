import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Upload
} from 'lucide-react';
// transactions fetched from backend via /api/transactions
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TransactionsProps {
  onNavigate?: (page: string) => void;
}

export function Transactions({ onNavigate }: TransactionsProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (userId) {
      // Fallback: send X-User-Id header so backend can authenticate without a JWT
      headers['X-User-Id'] = userId;
    }
    return headers;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch('http://127.0.0.1:8000/transactions', {
        headers: headers
      });

      if (res.ok) {
        const json = await res.json();
        
        // FIX: Ensure you set the state to the array inside the data property
        if (json && Array.isArray(json.data)) {
              setTransactionsData(json.data); // Use this if backend returns {"data": [...]}
          } else if (Array.isArray(json)) {
    setTransactionsData(json); // Use this if backend returns [...] directly
      } else {
        setTransactionsData([]);
      }
      } else if (res.status === 401) {
        setTransactionsData([]);
        setError('Sign in to see your personal transactions');
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success('Importing CSV...');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/transactions/import-csv', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: form
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.detail || err?.error || 'Import failed');
      } else {
        toast.success('CSV imported successfully');
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Import failed');
    }
    e.currentTarget.value = '';
  };

  const downloadBlob = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { headers: { ...getAuthHeaders() } });
      if (!res.ok) return toast.error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success(`${filename} downloaded`);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportCSV = () => downloadBlob('/api/transactions/export-csv', 'transactions.csv');

  const handleExportPDF = () => downloadBlob('/api/transactions/export-pdf', 'transactions.pdf');

  const categories = [
    'All Categories',
    'Food & Dining',
    'Income',
    'Shopping',
    'Entertainment',
    'Transportation',
    'Bills & Utilities',
    'Groceries'
  ];

  // Filter transactions
const filteredTransactions = transactionsData.filter(transaction => {
  // 1. Match Search (Merchant name)
  const matchesSearch = (transaction.merchant || '')
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  // 2. Match Category (Standardize both sides for comparison)
  const txCategory = (transaction.category || '').toLowerCase().trim();
  const currentFilter = categoryFilter.toLowerCase().trim();

  const matchesCategory = 
    currentFilter === 'all' || 
    currentFilter === 'all-categories' || 
    txCategory === currentFilter.replace(/-/g, ' ');

  return matchesSearch && matchesCategory;
});

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-muted-foreground mt-1">View and manage all your transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            variant="default"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-input-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category.toLowerCase().replace(/\s+/g, '-')}
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">All Transactions</h3>
        {loading && <div className="text-sm text-muted-foreground mb-3">Loading transactions...</div>}
        {error && <div className="text-sm text-destructive mb-3">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Merchant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-sm text-muted-foreground">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-sm text-muted-foreground">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.slice(startIndex, endIndex).map((transaction) => {
                  const isCredit = transaction.type === 'credit';

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCredit ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {isCredit ? (
                              <ArrowUpRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="font-medium">{transaction.merchant}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={isCredit ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-700 border-0'}>
                          {isCredit ? 'Credit' : 'Debit'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`font-semibold ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                          {isCredit ? '+' : '-'}₹{Math.abs(Number(transaction.amount || 0)).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge className="bg-green-100 text-green-700 border-0">
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {filteredTransactions.length} results
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={handlePreviousPage}>Previous</Button>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button key={index} variant="outline" size="sm" onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={handleNextPage}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}