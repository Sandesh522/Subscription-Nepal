export const PRICING_CONFIG = {
    netflix: {
        label: "Netflix",
        tag: "Movies & shows",
        id: "netflix",
        plans: [
            { name: "Mobile", desc: "480p · 1 mobile/tablet screen", priceNPR: 429, features: ["Stream on one mobile or tablet", "Standard definition (480p)"] },
            { name: "Basic", desc: "720p HD · TV compatible", priceNPR: 549, features: ["Works on TV, phone & laptop", "HD (720p) resolution"] },
            { name: "Standard", desc: "1080p Full HD · 2 screens at once", priceNPR: 1219, features: ["Two screens at the same time", "Full HD (1080p)"] },
            { name: "Premium", desc: "4K Ultra HD · 4 screens at once", priceNPR: 1499, features: ["Four screens at the same time", "4K Ultra HD + HDR"] }
        ]
    },
    prime: {
        label: "Prime Video",
        tag: "Movies, shows & Prime perks",
        id: "prime",
        plans: [
            { name: "Monthly", desc: "Billed every month", priceNPR: 669, features: ["Full HD streaming", "Prime Video + Prime perks"] },
            { name: "Quarterly", desc: "Billed every 3 months", priceNPR: 1249, features: ["Same features as monthly", "Better value than paying monthly"] },
            { name: "Annual", desc: "Billed once a year", priceNPR: 3119, features: ["Best per-month value", "Includes shopping + delivery perks"] }
        ]
    },
    spotify: {
        label: "Spotify",
        tag: "Music & podcasts",
        id: "spotify",
        plans: [
            { name: "Individual", desc: "1 account", priceNPR: 409, features: ["Ad-free music", "Offline downloads"] },
            { name: "Duo", desc: "2 accounts, same address", priceNPR: 499, features: ["Two separate Premium accounts", "Duo Mix playlist"] },
            { name: "Family", desc: "Up to 6 accounts", priceNPR: 509, features: ["Up to 6 Premium accounts", "Each with their own library"] },
            { name: "Yearly", desc: "1 account · billed annually", priceNPR: 2569, originalPriceNPR: 2999, features: ["Ad-free music, billed once a year", "Best value for a single account"] }
        ]
    },
    ytpremium: {
        label: "YouTube Premium",
        tag: "Ad-free video & music",
        id: "ytpremium",
        plans: [
            { name: "Individual", desc: "1 account", priceNPR: 429, features: ["Ad-free video & background play", "Includes YouTube Music Premium"] },
            { name: "Family", desc: "Up to 6 accounts", priceNPR: 829, features: ["Up to 6 members, same household", "Everyone gets their own account"] }
        ]
    },
    chatgpt: {
        label: "ChatGPT",
        tag: "AI assistant",
        id: "chatgpt",
        plans: [
            { name: "Go", desc: "Entry-level plan · higher limits than Free", priceNPR: 899, features: ["10x higher limits than Free", "Access to GPT-5", "Longer memory"] },
            { name: "Plus", desc: "Higher usage limits, faster responses", priceNPR: 3859, features: ["Priority access during busy hours", "Access to the latest models"] },
            { name: "Pro", desc: "Highest usage limits, most capable models", priceNPR: 38799, features: ["Unlimited access to GPT-5", "Access to GPT-5.5 Pro", "Extended limits for advanced tools"] }
        ]
    },
    claude: {
        label: "Claude",
        tag: "AI assistant",
        id: "claude",
        plans: [
            { name: "Pro Monthly", desc: "Billed every month", priceNPR: 3859, features: ["Send more messages with Claude Pro", "Access more Claude models", "Unlimited Projects"] },
            { name: "Pro Annual", desc: "Billed annually · save ~17%", priceNPR: 38799, features: ["Send more messages with Claude Pro", "Access more Claude models", "Unlimited Projects"] },
            { name: "Max 5x", desc: "5x more usage than Pro · billed monthly", priceNPR: 24799, features: ["5x more usage than Pro", "Higher output limits", "Priority access"] },
            { name: "Max 20x", desc: "20x more usage than Pro · billed monthly", priceNPR: 48799, features: ["20x more usage than Pro", "Highest output limits", "Priority access"] }
        ]
    }
};

export const CONTACT = {
    whatsappNumber: "9779769403836",
    instagramHandle: "premiumhubnepal2"
};
