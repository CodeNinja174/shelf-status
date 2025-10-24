-- Create stock table for inventory tracking
CREATE TABLE IF NOT EXISTS public.stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  available INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read stock data (public information)
CREATE POLICY "Anyone can view stock availability" 
ON public.stock 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to update stock (for demo purposes)
-- In production, you'd want to restrict this to authenticated admins
CREATE POLICY "Anyone can update stock availability" 
ON public.stock 
FOR UPDATE 
USING (true);

-- Insert initial stock row if table is empty
INSERT INTO public.stock (available)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM public.stock);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_stock_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stock_timestamp
BEFORE UPDATE ON public.stock
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_timestamp();