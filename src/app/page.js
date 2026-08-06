import { supabase } from "@/lib/supabase";
import ClientPage from "@/components/ClientPage";

export const revalidate = 0; // Disable static caching so price changes show up immediately

export default async function Page() {
    let pricingConfig = {};
    let blogs = [];

    try {
        // Fetch platforms
        const { data: platforms, error: platError } = await supabase
            .from("platforms")
            .select("*")
            .order("order_index", { ascending: true });

        if (platError) throw platError;

        // Fetch plans
        const { data: plans, error: plansError } = await supabase
            .from("plans")
            .select("*")
            .order("order_index", { ascending: true });

        if (plansError) throw plansError;
        
        // Fetch blogs
        const { data: blogsData, error: blogsError } = await supabase
            .from("blogs")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(3);
            
        if (blogsError) throw blogsError;
        blogs = blogsData || [];

        // Transform into PRICING_CONFIG structure
        platforms.forEach((platform) => {
            const platformPlans = plans
                .filter((p) => p.platform_id === platform.id)
                .map((p) => ({
                    name: p.name,
                    desc: p.desc,
                    priceNPR: p.price_npr,
                    originalPriceNPR: p.original_price_npr,
                    features: p.features
                }));

            pricingConfig[platform.id] = {
                label: platform.label,
                tag: platform.tag,
                id: platform.id,
                plans: platformPlans
            };
        });

    } catch (e) {
        console.error("Error fetching pricing from Supabase:", e);
        // Fallback or empty state if DB connection fails
    }

    return <ClientPage pricingConfig={pricingConfig} blogs={blogs} />;
}
