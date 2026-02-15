import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import api from '../../../api/axios';
import { formatDate } from '../../../lib/utils';
import { ShieldCheck, Eye, CheckCircle2, XCircle, FileText, Loader2, Clock, ExternalLink } from 'lucide-react';

export default function KYCVerification() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/analytics/admin/users');
            // Show only unverified users
            setVerifications(res.data.filter(u => u.kyc_status === 'unverified'));
        } catch (error) {
            console.error("Failed to fetch KYC requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        if (!selectedRequest) return;
        try {
            setIsProcessing(true);
            await api.patch(`/analytics/admin/users/${selectedRequest.id}/kyc?status=${status}`);
            setVerifications(prev => prev.filter(v => v.id !== selectedRequest.id));
            setSelectedRequest(null);
            setRejectionReason('');
        } catch (error) {
            console.error("KYC Action failed", error);
            alert("Action failed. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">KYC Verification</h1>
                <p className="text-muted-foreground">Review and verify user identity submissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-warning" />
                            <div className="text-3xl font-extrabold text-warning tracking-tight">{verifications.length}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Trust Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-success tracking-tight">94%</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. Review Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-primary">1.8h</div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending KYC Table */}
            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Submissions Awaiting Action ({verifications.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Scanning for new submissions...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : verifications.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/20">
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell className="font-bold">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-warning/20 text-warning border-none font-bold text-[10px] uppercase tracking-widest">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedRequest(user)}>
                                                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                                                    Review
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl border-none shadow-2xl">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold">KYC Review: {user.name}</DialogTitle>
                                                    <DialogDescription>Verify the submitted documents and provide a decision.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-6 pt-4">
                                                    <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl">
                                                        <div>
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">User ID</Label>
                                                            <div className="font-mono text-sm mt-0.5">{user.id}</div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email</Label>
                                                            <div className="mt-0.5">{user.email}</div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Submission Date</Label>
                                                            <div className="mt-0.5 font-medium">{formatDate(user.created_at)}</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-bold">Document Verification</Label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {['Aadhaar Front', 'Aadhaar Back', 'PAN Card', 'Live Selfie'].map((doc, i) => (
                                                                <div key={i} className="group relative h-28 bg-muted/40 rounded-xl border border-dashed border-border flex flex-col items-center justify-center transition-all hover:bg-muted/60 hover:border-primary/50 cursor-zoom-in">
                                                                    <ExternalLink className="absolute top-2 right-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    <FileText className="h-5 w-5 text-muted-foreground mb-1" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{doc}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="rejection_reason" className="text-sm font-bold">Decision Notes</Label>
                                                        <Textarea
                                                            id="rejection_reason"
                                                            placeholder="Optional: specify reason if rejecting..."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            className="bg-muted/20 border-none resize-none focus:ring-1 focus:ring-primary h-20"
                                                        />
                                                    </div>

                                                    <div className="flex gap-4 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            disabled={isProcessing}
                                                            className="flex-1 h-12 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-bold"
                                                            onClick={() => handleAction('rejected')}
                                                        >
                                                            <XCircle className="h-5 w-5 mr-2" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            disabled={isProcessing}
                                                            className="flex-1 h-12 bg-success hover:bg-success/90 text-white font-bold shadow-lg shadow-success/20 transition-all"
                                                            onClick={() => handleAction('verified')}
                                                        >
                                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && verifications.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                                        All caught up! No pending verifications.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
