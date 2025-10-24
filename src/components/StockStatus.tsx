import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle2, XCircle, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface StockData {
  id: string;
  available: number;
  updated_at: string;
}

export const StockStatus = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setStockData(data);
      setError(null);
      
      if (isManualRefresh) {
        toast.success("Stock status refreshed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStockData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchStockData(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-2xl animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
                  <RefreshCw className="h-12 w-12 text-primary" />
                </div>
              </div>
              <span className="text-lg font-medium text-muted-foreground animate-pulse">
                Loading stock data...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md border-destructive/50 shadow-2xl animate-scale-in">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Connection Error</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleManualRefresh} 
              className="w-full h-12 text-base font-medium"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAvailable = stockData?.available === 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="text-center pb-6 space-y-2">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-scale-in">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Stock Monitor</CardTitle>
          <CardDescription className="text-base">Real-time inventory availability</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pb-8">
          {/* Main Status Display */}
          <div
            className="relative overflow-hidden rounded-2xl p-10 text-center transition-all duration-500 animate-slide-up"
            style={{
              background: isAvailable 
                ? 'var(--gradient-success)' 
                : 'var(--gradient-unavailable)',
              boxShadow: isAvailable 
                ? 'var(--shadow-success)' 
                : 'var(--shadow-unavailable)',
            }}
          >
            {/* Animated background circles */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 animate-pulse-slow -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 animate-pulse-slow -ml-12 -mb-12" style={{ animationDelay: '1s' }} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm animate-bounce-subtle">
                {isAvailable ? (
                  <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
                ) : (
                  <XCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                )}
              </div>
              
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                Current Status
              </div>
              
              <div className="text-5xl font-black text-white drop-shadow-lg">
                {isAvailable ? "Available" : "Not Available"}
              </div>
              
              {isAvailable && (
                <div className="mt-4 text-sm font-medium text-white/80">
                  Ready to ship
                </div>
              )}
            </div>
          </div>

          {/* Status Info Bar */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {new Date(stockData?.updated_at || "").toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Auto-refresh: 10s
              </span>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full h-14 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            size="lg"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
