// 预设模板库及开箱即用默认数据
const MENU_TEMPLATES = {
    'modern-bistro': {
        id: 'modern-bistro',
        name: 'Modern Bistro (现代轻食)',
        styles: {
            bgClass: 'bg-[#FDFBF7]',
            textClass: 'text-[#2C2A29]',
            accentColor: '#D97757',
            fontClass: 'font-serif-warm'
        },
        data: {
            storeName: "AURA Bistro",
            tagline: "Fresh & Organic Daily",
            categories: [
                {
                    name: "Starters",
                    items: [
                        { name: "Truffle Fries", price: "$12", desc: "Hand-cut potatoes, parmesan, black truffle oil" },
                        { name: "Burrata Salad", price: "$16", desc: "Heirloom tomatoes, pesto, balsamic glaze" }
                    ]
                },
                {
                    name: "Main Course",
                    items: [
                        { name: "Ribeye Steak 10oz", price: "$34", desc: "Grass-fed beef, garlic butter, asparagus" }
                    ]
                }
            ]
        }
    },
    'japanese-dining': {
        id: 'japanese-dining',
        name: 'Japanese Dining (日式料理)',
        styles: {
            bgClass: 'bg-[#1A1918]',
            textClass: 'text-[#FDFBF7]',
            accentColor: '#E54D2E',
            fontClass: 'font-sans'
        },
        data: {
            storeName: "SEN Sushi Bar",
            tagline: "Authentic Edo-Style Omakase",
            categories: [
                {
                    name: "Sashimi",
                    items: [
                        { name: "Salmon Osetra", price: "$22", desc: "Fresh Atlantic salmon, fresh horseradish" },
                        { name: "Bluefin Tuna Toro", price: "$35", desc: "Fatty tuna belly with gold leaf garnish" }
                    ]
                }
            ]
        }
    }
};
