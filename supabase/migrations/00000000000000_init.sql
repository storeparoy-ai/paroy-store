-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  whatsapp text,
  role text DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create products table
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  price numeric NOT NULL,
  rental_price_daily numeric,
  can_rental boolean DEFAULT false,
  status text DEFAULT 'active'::text,
  game text NOT NULL, -- e.g., 'MLBB', 'Free Fire'
  images text[] DEFAULT '{}'::text[],
  specs jsonb DEFAULT '{}'::jsonb,
  seller_id uuid REFERENCES public.profiles(id),
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins and sellers can insert products." ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and sellers can update their products." ON public.products FOR UPDATE USING (auth.uid() = seller_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create orders table
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  buyer_id uuid REFERENCES public.profiles(id),
  product_id uuid REFERENCES public.products(id),
  amount numeric NOT NULL,
  status text DEFAULT 'pending'::text,
  mode text DEFAULT 'buy'::text, -- 'buy' or 'rental'
  payment_method text,
  proof_url text,
  note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can create orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Only admins can update orders." ON public.orders FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create community_posts table
CREATE TABLE public.community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  game text,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone." ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts." ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, whatsapp, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert initial dummy data for products so the UI doesn't look empty
INSERT INTO public.products (id, title, price, can_rental, rental_price_daily, game, images, specs, view_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Akun MLBB Mythic Glory 100 Stars, All Skin KOF, 20 Legend', 4500000, true, 50000, 'MLBB', ARRAY['https://placehold.co/600x400/100e0d/e8789f?text=MLBB+Mythic'], '{"Level": "100", "Hero": "120", "Skin": "350"}', 1420),
  ('22222222-2222-2222-2222-222222222222', 'Akun Free Fire Sultan, Elite Pass S1-S50 Full, SG 2 Ungu', 2500000, false, null, 'Free Fire', ARRAY['https://placehold.co/600x400/100e0d/ff5555?text=FF+Sultan'], '{"Level": "75", "Pet": "Semua", "Senjata": "Evo Max"}', 850);
