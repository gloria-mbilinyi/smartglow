import logging
from sqlalchemy.orm import Session
from app.models.category import Category
from app.models.product import Product
from app.models.ingredient import Ingredient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INITIAL_CATEGORIES = [
    {"name": "Skincare", "slug": "skincare", "description": "Hydrating creams, barrier treatments, and overnight resurfacing"},
    {"name": "Serums", "slug": "serums", "description": "High-potency targeted bio-actives, vitamins, and multi-peptides"},
    {"name": "Cleansers", "slug": "cleansers", "description": "Gentle botanical foaming washes and pore-clarifying cleansers"},
    {"name": "Sun Care", "slug": "sun-care", "description": "Broad-spectrum mineral SPF 50 fluids and dewy antioxidant mists"},
    {"name": "Makeup", "slug": "makeup", "description": "Skin-enhancing breathable tints and peptide lip & cheek balms"},
]

INITIAL_PRODUCTS = [
    {
        "id": "sg-serum-01",
        "name": "Botanical Radiance Serum",
        "subtitle": "15% Stabilized Vitamin C & Ferulic Complex",
        "slug": "botanical-radiance-serum",
        "category_slug": "serums",
        "price": 48.0,
        "rating": 4.9,
        "reviews_count": 142,
        "skin_types": ["Normal", "Dry", "Combination", "Oily"],
        "skin_concerns": ["Dullness", "Hyperpigmentation", "Fine Lines"],
        "key_ingredients_list": ["15% Sodium Ascorbyl Phosphate", "0.5% Ferulic Acid", "Hyaluronic Acid"],
        "all_ingredients": "Aqua, Sodium Ascorbyl Phosphate, Propanediol, Ferulic Acid, Hyaluronic Acid, Camellia Sinensis Leaf Extract, Glycerin, Tocopherol, Ethylhexylglycerin.",
        "description": "A featherlight, quick-absorbing antioxidant elixir formulated to illuminate tired complexions, visibly even out hyperpigmentation, and neutralize environmental stressors.",
        "benefits": [
            "Visibly clarifies tone and dark spots without irritation",
            "Provides daily antioxidant barrier against oxidative pollution",
            "Lightweight water-gel base layers flawlessly under makeup"
        ],
        "usage": "Dispense 3–4 drops onto freshly cleansed fingertips. Gently press over face and décolleté each morning before moisturizer.",
        "volume": "30 ml / 1.0 fl oz",
        "stock_count": 28,
        "image_url": "/src/assets/images/product_radiance_serum_1793111027544.jpg",
        "tag": "Bestseller",
    },
    {
        "id": "sg-serum-02",
        "name": "Tri-Peptide Barrier Renewal Serum",
        "subtitle": "Multi-Molecular Ceramides & Copper Peptides",
        "slug": "tri-peptide-barrier-renewal-serum",
        "category_slug": "serums",
        "price": 52.0,
        "rating": 4.8,
        "reviews_count": 89,
        "skin_types": ["Dry", "Sensitive", "Combination", "Normal"],
        "skin_concerns": ["Dehydration", "Redness", "Fine Lines"],
        "key_ingredients_list": ["Copper Tripeptide-1", "Ceramide NP/AP/EOP", "Centella Asiatica"],
        "all_ingredients": "Aqua, Glycerin, Butylene Glycol, Ceramide NP, Ceramide AP, Phytosphingosine, Copper Tripeptide-1, Centella Asiatica Extract, Allantoin, Panthenol.",
        "description": "Targeted restorative serum designed to rebuild fragile lipid barriers, alleviate persistent redness, and lock in sustained multi-tier hydration.",
        "benefits": [
            "Fortifies compromised moisture barriers within 7 days",
            "Soothes visible reactive redness and post-cleansing sensitivity",
            "Velvety emulsion texture restores skin suppleness"
        ],
        "usage": "Smooth 1 full dropper over damp skin morning and evening. Follow with barrier cream.",
        "volume": "30 ml / 1.0 fl oz",
        "stock_count": 19,
        "image_url": "/src/assets/images/product_radiance_serum_1793111027544.jpg",
        "tag": "Staff Favorite",
    },
    {
        "id": "sg-cleanse-01",
        "name": "Gentle Botanical Gel Cleanser",
        "subtitle": "Green Tea & Aloe Hydrating Wash",
        "slug": "gentle-botanical-gel-cleanser",
        "category_slug": "cleansers",
        "price": 26.0,
        "rating": 4.9,
        "reviews_count": 215,
        "skin_types": ["All", "Sensitive", "Normal", "Dry"],
        "skin_concerns": ["Redness", "Dehydration"],
        "key_ingredients_list": ["Organic Aloe Vera Leaf Juice", "Green Tea Extract", "Oat Beta-Glucan"],
        "all_ingredients": "Aqua, Aloe Barbadensis Leaf Juice, Coco-Glucoside, Camellia Sinensis (Green Tea) Leaf Extract, Avena Sativa (Oat) Kernel Flour, Glycerin, Citric Acid.",
        "description": "A pH-balanced 5.5 foaming gel cleanser that dissolves impurities, daily grime, and light cosmetic pigments without stripping essential cellular lipids.",
        "benefits": [
            "Maintains natural acidic skin mantle without tight after-feel",
            "Calms flush-prone and allergy-sensitive complexions",
            "Biodegradable, sulfate-free and micro-foaming formula"
        ],
        "usage": "Massage a dime-sized amount onto damp face for 60 seconds with circular motions. Rinse thoroughly with lukewarm water.",
        "volume": "200 ml / 6.7 fl oz",
        "stock_count": 45,
        "image_url": "/src/assets/images/product_botanical_cleanser_1793111029123.jpg",
        "tag": "Essential Routine",
    },
    {
        "id": "sg-cleanse-02",
        "name": "Purifying Salicylic Acid Wash",
        "subtitle": "2% BHA Pore Clarifying Cleanser",
        "slug": "purifying-salicylic-acid-wash",
        "category_slug": "cleansers",
        "price": 28.0,
        "rating": 4.7,
        "reviews_count": 110,
        "skin_types": ["Oily", "Combination"],
        "skin_concerns": ["Acne & Pores", "Dullness"],
        "key_ingredients_list": ["2% Salicylic Acid (BHA)", "Zinc PCA", "Tea Tree Leaf Hydrosol"],
        "all_ingredients": "Aqua, Cocamidopropyl Betaine, Salicylic Acid, Zinc PCA, Melaleuca Alternifolia Leaf Water, Niacinamide, Sodium Hydroxide, Sodium Benzoate.",
        "description": "Deeply penetrative pore-clearing gel wash featuring micro-encapsulated salicylic acid to dislodge trapped sebum, refine coarse pores, and regulate oil shine.",
        "benefits": [
            "Unclogs cellular debris within deep follicle linings",
            "Zinc PCA balances excess afternoon sebum production",
            "Refines rough, congested skin texture"
        ],
        "usage": "Use evening 3–4 times weekly. Work into a delicate foam and rinse. Gradually increase to daily use as tolerated.",
        "volume": "150 ml / 5.1 fl oz",
        "stock_count": 34,
        "image_url": "/src/assets/images/product_botanical_cleanser_1793111029123.jpg",
    },
    {
        "id": "sg-sun-01",
        "name": "Hydrating Mineral Fluid SPF 50",
        "subtitle": "Broad Spectrum UVA/UVB Non-Nano Zinc",
        "slug": "hydrating-mineral-fluid-spf-50",
        "category_slug": "sun-care",
        "price": 36.0,
        "rating": 4.9,
        "reviews_count": 308,
        "skin_types": ["All", "Sensitive", "Combination", "Dry"],
        "skin_concerns": ["Dullness", "Hyperpigmentation", "Redness"],
        "key_ingredients_list": ["18.5% Non-Nano Zinc Oxide", "Ceramides", "High Molecular HA"],
        "all_ingredients": "Zinc Oxide 18.5%, Aqua, Caprylic/Capric Triglyceride, Squalane, Ceramide NP, Sodium Hyaluronate, Tocopheryl Acetate, Polyhydroxystearic Acid.",
        "description": "An invisible, weightless mineral fluid shield delivering daily broad-spectrum SPF 50 defense with absolutely zero white residue or greasy film.",
        "benefits": [
            "100% mineral physical filter safe for coral reefs and sensitive eyes",
            "Zero chalky cast on all Fitzpatrick skin tones (I–VI)",
            "Acts as a smooth, velvet makeup primer"
        ],
        "usage": "Shake bottle gently. Apply two finger lengths generously to face and ears as the final step of morning routine 15 minutes before sun exposure.",
        "volume": "40 ml / 1.35 fl oz",
        "stock_count": 50,
        "image_url": "/src/assets/images/product_mineral_sunscreen_1793111028905.jpg",
        "tag": "Customer Choice",
    },
    {
        "id": "sg-sun-02",
        "name": "Dewy Antioxidant Sun Mist SPF 45",
        "subtitle": "Invisible Glow Reapplication Shield",
        "slug": "dewy-antioxidant-sun-mist-spf-45",
        "category_slug": "sun-care",
        "price": 32.0,
        "rating": 4.6,
        "reviews_count": 78,
        "skin_types": ["Normal", "Dry", "Combination"],
        "skin_concerns": ["Dehydration", "Dullness"],
        "key_ingredients_list": ["Avobenzone/Octisalate Matrix", "Ectoin", "Rose Flower Water"],
        "all_ingredients": "Aqua, Rosa Damascena Flower Water, Ectoin, Caprylic Triglycerides, Octocrylene, Avobenzone, Glycerin, Silica, Phenoxyethanol.",
        "description": "An ultra-fine continuous mist designed for seamless on-the-go SPF touchups over cosmetics without disturbing coverage or powder layers.",
        "benefits": [
            "Effortless 360-degree reapplication over finished makeup",
            "Infused with extremolyte Ectoin for pollution defense",
            "Leaves an instant luminous glass-skin glow"
        ],
        "usage": "Hold 8–10 inches from face with eyes and mouth closed. Mist evenly in circular motion every 2 hours when outdoors.",
        "volume": "75 ml / 2.5 fl oz",
        "stock_count": 22,
        "image_url": "/src/assets/images/product_mineral_sunscreen_1793111028905.jpg",
    },
    {
        "id": "sg-skin-01",
        "name": "Ceramide Barrier Recovery Cream",
        "subtitle": "Rich Biomimetic Moisture Shield",
        "slug": "ceramide-barrier-recovery-cream",
        "category_slug": "skincare",
        "price": 44.0,
        "rating": 4.8,
        "reviews_count": 167,
        "skin_types": ["Dry", "Sensitive", "Normal"],
        "skin_concerns": ["Dehydration", "Redness"],
        "key_ingredients_list": ["3:1:1 Physiological Lipid Complex", "Colloidal Oat Flour", "Squalane"],
        "all_ingredients": "Aqua, Squalane, Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Ceramide NP, Cholesterol, Free Fatty Acids, Avena Sativa.",
        "description": "A deeply comforting lipid-replenishing moisture cream mimicking the natural intercellular matrix to seal transepidermal water loss and protect irritated skin.",
        "benefits": [
            "Clinically formulated 3:1:1 ratio of ceramides, cholesterol, and fatty acids",
            "Restores suppleness and relief within 24 hours of use",
            "Free from artificial fragrances, essential oils, and parabens"
        ],
        "usage": "Warm a pea-sized amount between fingertips and press into face and neck morning and night.",
        "volume": "50 ml / 1.7 fl oz",
        "stock_count": 31,
        "image_url": "/src/assets/images/hero_smartglow_cosmetics_1793111027189.jpg",
        "tag": "Dermatologist Tested",
    },
    {
        "id": "sg-skin-02",
        "name": "Overnight Resurfacing AHA/BHA Balm",
        "subtitle": "8% Lactic Acid & Gentle Willow Bark",
        "slug": "overnight-resurfacing-aha-bha-balm",
        "category_slug": "skincare",
        "price": 46.0,
        "rating": 4.7,
        "reviews_count": 92,
        "skin_types": ["Combination", "Oily", "Normal"],
        "skin_concerns": ["Dullness", "Hyperpigmentation", "Fine Lines"],
        "key_ingredients_list": ["8% Vegan Lactic Acid", "Willow Bark Extract", "Niacinamide"],
        "all_ingredients": "Aqua, Lactic Acid, Propanediol, Salix Alba (Willow) Bark Extract, Niacinamide, Sodium Hyaluronate, Hydroxyethylcellulose, Phenoxyethanol.",
        "description": "A nocturnal gentle peeling cream that dissolves sluggish surface keratinocytes overnight to reveal refined, glowing, and silky smooth skin by sunrise.",
        "benefits": [
            "Exfoliates dead surface cells without micro-tears or stinging",
            "Fades post-blemish discoloration with consistent nocturnal use",
            "Infused with moisture-retaining humectants to prevent dryness"
        ],
        "usage": "Apply 2–3 pumps at night onto clean, dry face. Use 2–3 times weekly. Always follow with daytime SPF 50.",
        "volume": "50 ml / 1.7 fl oz",
        "stock_count": 18,
        "image_url": "/src/assets/images/hero_smartglow_cosmetics_1793111027189.jpg",
    },
    {
        "id": "sg-make-01",
        "name": "Luminous Sheer Dewy Skin Tint",
        "subtitle": "Hyaluronic Infused Breathable Glow",
        "slug": "luminous-sheer-dewy-skin-tint",
        "category_slug": "makeup",
        "price": 38.0,
        "rating": 4.9,
        "reviews_count": 230,
        "skin_types": ["All", "Dry", "Normal", "Combination"],
        "skin_concerns": ["Dullness", "Dehydration"],
        "key_ingredients_list": ["Multi-Weight Hyaluronic Acid", "Rose Glow Mineral Mica", "Marula Oil"],
        "all_ingredients": "Aqua, Hydrogenated Ethylhexyl Olivate, Mica, Glycerin, Sclerocarya Birrea Seed Oil, Sodium Hyaluronate, CI 77891, CI 77491, CI 77492, CI 77499.",
        "description": "A hybrid skincare-makeup tint delivering buildable sheer-to-medium coverage with a lit-from-within second-skin satin luminosity.",
        "benefits": [
            "Non-comedogenic formula lets pores breathe freely throughout the day",
            "Infused with skincare-grade humectants for 12-hour continuous hydration",
            "Adapts seamlessly across complexion nuances"
        ],
        "usage": "Shake well. Dispense 1–2 drops on cheeks and forehead, blending smoothly with fingertips or damp sponge for a fresh glow.",
        "volume": "30 ml / 1.0 fl oz",
        "stock_count": 36,
        "image_url": "/src/assets/images/product_dewy_tint_1793111029554.jpg",
        "tag": "Award Winner",
    },
    {
        "id": "sg-make-02",
        "name": "Botanical Lip & Cheek Flush",
        "subtitle": "Sheer Hydrating Peptide Balm",
        "slug": "botanical-lip-cheek-flush",
        "category_slug": "makeup",
        "price": 24.0,
        "rating": 4.8,
        "reviews_count": 154,
        "skin_types": ["All", "Sensitive"],
        "skin_concerns": ["Dehydration"],
        "key_ingredients_list": ["Palmitoyl Tripeptide-38", "Organic Jojoba Seed Oil", "Vitamin E"],
        "all_ingredients": "Ricinus Communis Seed Oil, Simmondsia Chinensis Seed Oil, Cera Alba, Palmitoyl Tripeptide-38, Tocopherol, Iron Oxides, CI 15850.",
        "description": "A multi-use dewy color balm for cheeks and lips melting effortlessly upon skin contact to impart a natural, healthy flush of radiant color.",
        "benefits": [
            "Dual-purpose tint for rapid morning minimalist beauty routines",
            "Plumps and hydrates dry lips with biomimetic peptide technology",
            "Pocket-friendly chic frosted glass container"
        ],
        "usage": "Dab gently onto apples of cheeks and tap into lips using ring finger. Layer for intensified pigment.",
        "volume": "10 g / 0.35 oz",
        "stock_count": 40,
        "image_url": "/src/assets/images/product_dewy_tint_1793111029554.jpg",
    },
]


def init_db(db: Session) -> None:
    # 1. Seed Categories
    category_map = {}
    for cat_data in INITIAL_CATEGORIES:
        category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not category:
            category = Category(**cat_data)
            db.add(category)
            db.flush()
        category_map[cat_data["slug"]] = category.id

    # 2. Seed Products
    for prod_data in INITIAL_PRODUCTS:
        prod_dict = dict(prod_data)
        category_slug = prod_dict.pop("category_slug")
        category_id = category_map[category_slug]

        product = db.query(Product).filter(Product.id == prod_dict["id"]).first()
        if not product:
            product = Product(**prod_dict, category_id=category_id)
            db.add(product)

    db.commit()
    logger.info("Database initialized with seed catalog.")
