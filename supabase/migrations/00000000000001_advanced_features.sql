-- Create topup_orders table
CREATE TABLE public.topup_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles(id),
  game text NOT NULL,
  game_user_id text NOT NULL,
  item_label text NOT NULL,
  amount numeric NOT NULL,
  payment_method text,
  payment_proof_url text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.topup_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topups." ON public.topup_orders FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can create topups." ON public.topup_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Only admins can update topups." ON public.topup_orders FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create rekber_orders table
CREATE TABLE public.rekber_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES public.profiles(id),
  item_description text NOT NULL,
  amount numeric NOT NULL,
  fee numeric DEFAULT 0,
  seller_contact text NOT NULL,
  status text DEFAULT 'pending'::text,
  admin_note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.rekber_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rekber." ON public.rekber_orders FOR SELECT USING (auth.uid() = requester_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can create rekber." ON public.rekber_orders FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Only admins can update rekber." ON public.rekber_orders FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create flash_sales table
CREATE TABLE public.flash_sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price numeric NOT NULL,
  stock integer NOT NULL,
  sold integer DEFAULT 0,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flash sales viewable by everyone." ON public.flash_sales FOR SELECT USING (true);
CREATE POLICY "Only admins can insert flash sales." ON public.flash_sales FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Only admins can update flash sales." ON public.flash_sales FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
