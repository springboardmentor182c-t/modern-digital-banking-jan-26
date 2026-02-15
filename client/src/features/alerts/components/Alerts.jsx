import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { useAlerts } from '../context/AlertsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle2, Search, Filter, Trash2, CheckCircle } from 'lucide-react';
import { cn, formatDate, formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

export default function Alerts() {
  const { alerts, loading, refreshAlerts } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = refreshAlerts;

  const handleMarkAsRead = async (alertId) => {
    try {
      await api.patch(`/analytics/alerts/${alertId}/read`);
      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (error) {
      console.error("Failed to mark alert as read", error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'low_balance':
        return <Info className="h-5 w-5 text-warning" />;
      case 'bill_due':
        return <Bell className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return "bg-destructive/10 border-destructive/20";
      case 'low_balance':
        return "bg-warning/10 border-warning/20";
      case 'bill_due':
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-muted/50 border-border";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Alert Center</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your account activity and security</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 font-bold bg-background/50 border-border/50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 font-bold bg-background/50 border-border/50 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse">
            <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your alerts...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card key={alert.id} className={cn(
              "group relative border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden",
              getAlertColor(alert.type),
              alert.is_read ? "opacity-60 grayscale-[0.5]" : ""
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-sm",
                    alert.type === 'budget_exceeded' ? "bg-destructive text-white" :
                      alert.type === 'low_balance' ? "bg-warning text-white" : "bg-primary text-white"
                  )}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {alert.type.replace('_', ' ')}
                        </span>
                        {!alert.is_read && (
                          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-border/50 text-[10px] font-bold">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/60 whitespace-nowrap uppercase tracking-widest">
                        {formatDateTime(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90 mb-3">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4">
                      {!alert.is_read && (
                        <Button
                          onClick={() => handleMarkAsRead(alert.id)}
                          variant="link"
                          className="p-0 h-auto text-xs font-bold hover:no-underline opacity-70 hover:opacity-100 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedAlert(alert)}
                        variant="link"
                        className="p-0 h-auto text-xs font-bold hover:no-underline opacity-70 hover:opacity-100 flex items-center gap-1.5"
                      >
                        <Info className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-card border border-border border-dashed rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Any security updates or account notifications will appear here as soon as they're generated.
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-muted/30 border-b border-white/5 relative">
              <button
                onClick={() => setSelectedAlert(null)}
                className="absolute right-4 top-4 p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  selectedAlert.type === 'budget_exceeded' ? "bg-destructive text-white" :
                    selectedAlert.type === 'low_balance' ? "bg-warning text-white" : "bg-primary text-white"
                )}>
                  {getAlertIcon(selectedAlert.type)}
                </div>
                <div>
                  <CardTitle className="text-xl">Alert Intelligence</CardTitle>
                  <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Ref: {selectedAlert.id}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                  <Badge variant="outline" className="uppercase font-bold text-[10px]">{selectedAlert.type.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</span>
                  <span className="text-sm font-medium">{formatDateTime(selectedAlert.created_at)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                  <Badge className={selectedAlert.is_read ? "bg-muted text-muted-foreground" : "bg-primary text-white"}>
                    {selectedAlert.is_read ? "READ" : "UNREAD"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-2xl border border-white/5">
                <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                  "{selectedAlert.message}"
                </p>
              </div>

              <div className="flex gap-4">
                {!selectedAlert.is_read && (
                  <Button
                    variant="link"
                    className="flex-1 h-12 font-bold"
                    onClick={() => {
                      handleMarkAsRead(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
                <Button
                  className="flex-1 h-12 bg-primary text-white font-bold"
                  onClick={() => setSelectedAlert(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
