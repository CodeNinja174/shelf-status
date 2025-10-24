import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading stock data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManualRefresh} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAvailable = stockData?.available === 1;
  const statusColor = isAvailable ? "hsl(var(--success))" : "hsl(var(--unavailable))";
  const statusText = isAvailable ? "Available" : "Not Available";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Stock Status</CardTitle>
          <CardDescription>Real-time inventory availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="rounded-lg p-8 text-center transition-all duration-300"
            style={{
              backgroundColor: `${statusColor}15`,
              borderWidth: "2px",
              borderColor: statusColor,
            }}
          >
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Current Status
            </div>
            <div
              className="text-4xl font-bold"
              style={{ color: statusColor }}
            >
              {statusText}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Last updated: {new Date(stockData?.updated_at || "").toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Auto-refresh: 10s
            </span>
          </div>

          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
