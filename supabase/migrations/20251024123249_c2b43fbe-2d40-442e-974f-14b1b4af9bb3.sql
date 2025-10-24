-- Fix search path for the update_stock_timestamp function
CREATE OR REPLACE FUNCTION public.update_stock_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;