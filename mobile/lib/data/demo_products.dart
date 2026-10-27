import '../models/product_model.dart';
import '../models/category_model.dart';

class DemoProducts {
  static final List<CategoryModel> categories = [
    const CategoryModel(id: 1, name: 'Skincare', slug: 'skincare', productsCount: 2),
    const CategoryModel(id: 2, name: 'Serums', slug: 'serums', productsCount: 2),
    const CategoryModel(id: 3, name: 'Cleansers', slug: 'cleansers', productsCount: 2),
    const CategoryModel(id: 4, name: 'Sun Care', slug: 'sun-care', productsCount: 2),
    const CategoryModel(id: 5, name: 'Makeup', slug: 'makeup', productsCount: 2),
  ];

  static final List<ProductModel> products = [
    // Serums
    const ProductModel(
      id: 'sg-serum-01',
      name: 'Botanical Radiance Serum',
      subtitle: '15% Stabilized Vitamin C & Ferulic Complex',
      slug: 'botanical-radiance-serum',
      price: 48.0,
      rating: 4.9,
      reviewsCount: 142,
      skinTypes: ['Normal', 'Dry', 'Combination', 'Oily'],
      skinConcerns: ['Dullness', 'Hyperpigmentation', 'Fine Lines'],
      keyIngredients: ['15% Sodium Ascorbyl Phosphate', '0.5% Ferulic Acid', 'Hyaluronic Acid'],
      allIngredients:
          'Aqua, Sodium Ascorbyl Phosphate, Propanediol, Ferulic Acid, Hyaluronic Acid, Camellia Sinensis Leaf Extract, Glycerin, Tocopherol, Ethylhexylglycerin.',
      description:
          'A featherlight, quick-absorbing antioxidant elixir formulated to illuminate tired complexions, visibly even out hyperpigmentation, and neutralize environmental stressors.',
      benefits: [
        'Visibly clarifies tone and dark spots without irritation',
        'Provides daily antioxidant barrier against oxidative pollution',
        'Lightweight water-gel base layers flawlessly under makeup',
      ],
      usage:
          'Dispense 3–4 drops onto freshly cleansed fingertips. Gently press over face and décolleté each morning before moisturizer.',
      volume: '30 ml / 1.0 fl oz',
      stockCount: 28,
      imageUrl: '/src/assets/images/product_radiance_serum_1793111027544.jpg',
      tag: 'Bestseller',
      category: CategoryModel(id: 2, name: 'Serums', slug: 'serums'),
    ),
    const ProductModel(
      id: 'sg-serum-02',
      name: 'Tri-Peptide Barrier Renewal Serum',
      subtitle: 'Multi-Molecular Ceramides & Copper Peptides',
      slug: 'tri-peptide-barrier-renewal-serum',
      price: 52.0,
      rating: 4.8,
      reviewsCount: 89,
      skinTypes: ['Dry', 'Sensitive', 'Combination', 'Normal'],
      skinConcerns: ['Dehydration', 'Redness', 'Fine Lines'],
      keyIngredients: ['Copper Tripeptide-1', 'Ceramide NP/AP/EOP', 'Centella Asiatica'],
      allIngredients:
          'Aqua, Glycerin, Butylene Glycol, Ceramide NP, Ceramide AP, Phytosphingosine, Copper Tripeptide-1, Centella Asiatica Extract, Allantoin, Panthenol.',
      description:
          'Targeted restorative serum designed to rebuild fragile lipid barriers, alleviate persistent redness, and lock in sustained multi-tier hydration.',
      benefits: [
        'Fortifies compromised moisture barriers within 7 days',
        'Soothes visible reactive redness and post-cleansing sensitivity',
        'Velvety emulsion texture restores skin suppleness',
      ],
      usage: 'Smooth 1 full dropper over damp skin morning and evening. Follow with barrier cream.',
      volume: '30 ml / 1.0 fl oz',
      stockCount: 19,
      imageUrl: '/src/assets/images/product_radiance_serum_1793111027544.jpg',
      tag: 'Staff Favorite',
      category: CategoryModel(id: 2, name: 'Serums', slug: 'serums'),
    ),

    // Cleansers
    const ProductModel(
      id: 'sg-cleanse-01',
      name: 'Gentle Botanical Gel Cleanser',
      subtitle: 'Green Tea & Aloe Hydrating Wash',
      slug: 'gentle-botanical-gel-cleanser',
      price: 26.0,
      rating: 4.9,
      reviewsCount: 215,
      skinTypes: ['All', 'Sensitive', 'Normal', 'Dry'],
      skinConcerns: ['Redness', 'Dehydration'],
      keyIngredients: ['Organic Aloe Vera Leaf Juice', 'Green Tea Extract', 'Oat Beta-Glucan'],
      allIngredients:
          'Aqua, Aloe Barbadensis Leaf Juice, Coco-Glucoside, Camellia Sinensis (Green Tea) Leaf Extract, Avena Sativa (Oat) Kernel Flour, Glycerin, Citric Acid.',
      description:
          'A pH-balanced 5.5 foaming gel cleanser that dissolves impurities, daily grime, and light cosmetic pigments without stripping essential cellular lipids.',
      benefits: [
        'Maintains natural acidic skin mantle without tight after-feel',
        'Calms flush-prone and allergy-sensitive complexions',
        'Biodegradable, sulfate-free and micro-foaming formula',
      ],
      usage:
          'Massage a dime-sized amount onto damp face for 60 seconds with circular motions. Rinse thoroughly with lukewarm water.',
      volume: '200 ml / 6.7 fl oz',
      stockCount: 45,
      imageUrl: '/src/assets/images/product_botanical_cleanser_1793111029123.jpg',
      tag: 'Essential Routine',
      category: CategoryModel(id: 3, name: 'Cleansers', slug: 'cleansers'),
    ),
    const ProductModel(
      id: 'sg-cleanse-02',
      name: 'Purifying Salicylic Acid Wash',
      subtitle: '2% BHA Pore Clarifying Cleanser',
      slug: 'purifying-salicylic-acid-wash',
      price: 28.0,
      rating: 4.7,
      reviewsCount: 110,
      skinTypes: ['Oily', 'Combination'],
      skinConcerns: ['Acne & Pores', 'Dullness'],
      keyIngredients: ['2% Salicylic Acid (BHA)', 'Zinc PCA', 'Tea Tree Leaf Hydrosol'],
      allIngredients:
          'Aqua, Cocamidopropyl Betaine, Salicylic Acid, Zinc PCA, Melaleuca Alternifolia Leaf Water, Niacinamide, Sodium Hydroxide, Sodium Benzoate.',
      description:
          'Deeply penetrative pore-clearing gel wash featuring micro-encapsulated salicylic acid to dislodge trapped sebum, refine coarse pores, and regulate oil shine.',
      benefits: [
        'Unclogs cellular debris within deep follicle linings',
        'Zinc PCA balances excess afternoon sebum production',
        'Refines rough, congested skin texture',
      ],
      usage:
          'Use evening 3–4 times weekly. Work into a delicate foam and rinse. Gradually increase to daily use as tolerated.',
      volume: '150 ml / 5.1 fl oz',
      stockCount: 34,
      imageUrl: '/src/assets/images/product_botanical_cleanser_1793111029123.jpg',
      category: CategoryModel(id: 3, name: 'Cleansers', slug: 'cleansers'),
    ),

    // Sun Care
    const ProductModel(
      id: 'sg-sun-01',
      name: 'Hydrating Mineral Fluid SPF 50',
      subtitle: 'Broad Spectrum UVA/UVB Non-Nano Zinc',
      slug: 'hydrating-mineral-fluid-spf-50',
      price: 36.0,
      rating: 4.9,
      reviewsCount: 308,
      skinTypes: ['All', 'Sensitive', 'Combination', 'Dry'],
      skinConcerns: ['Dullness', 'Hyperpigmentation', 'Redness'],
      keyIngredients: ['18.5% Non-Nano Zinc Oxide', 'Ceramides', 'High Molecular HA'],
      allIngredients:
          'Zinc Oxide 18.5%, Aqua, Caprylic/Capric Triglyceride, Squalane, Ceramide NP, Sodium Hyaluronate, Tocopheryl Acetate, Polyhydroxystearic Acid.',
      description:
          'An invisible, weightless mineral fluid shield delivering daily broad-spectrum SPF 50 defense with absolutely zero white residue or greasy film.',
      benefits: [
        '100% mineral physical filter safe for coral reefs and sensitive eyes',
        'Zero chalky cast on all Fitzpatrick skin tones (I–VI)',
        'Acts as a smooth, velvet makeup primer',
      ],
      usage:
          'Shake bottle gently. Apply two finger lengths generously to face and ears as the final step of morning routine 15 minutes before sun exposure.',
      volume: '40 ml / 1.35 fl oz',
      stockCount: 50,
      imageUrl: '/src/assets/images/product_mineral_sunscreen_1793111028905.jpg',
      tag: 'Customer Choice',
      category: CategoryModel(id: 4, name: 'Sun Care', slug: 'sun-care'),
    ),
    const ProductModel(
      id: 'sg-sun-02',
      name: 'Dewy Antioxidant Sun Mist SPF 45',
      subtitle: 'Invisible Glow Reapplication Shield',
      slug: 'dewy-antioxidant-sun-mist-spf-45',
      price: 32.0,
      rating: 4.6,
      reviewsCount: 78,
      skinTypes: ['Normal', 'Dry', 'Combination'],
      skinConcerns: ['Dehydration', 'Dullness'],
      keyIngredients: ['Avobenzone/Octisalate Matrix', 'Ectoin', 'Rose Flower Water'],
      allIngredients:
          'Aqua, Rosa Damascena Flower Water, Ectoin, Caprylic Triglycerides, Octocrylene, Avobenzone, Glycerin, Silica, Phenoxyethanol.',
      description:
          'An ultra-fine continuous mist designed for seamless on-the-go SPF touchups over cosmetics without disturbing coverage or powder layers.',
      benefits: [
        'Effortless 360-degree reapplication over finished makeup',
        'Infused with extremolyte Ectoin for pollution defense',
        'Leaves an instant luminous glass-skin glow',
      ],
      usage:
          'Hold 8–10 inches from face with eyes and mouth closed. Mist evenly in circular motion every 2 hours when outdoors.',
      volume: '75 ml / 2.5 fl oz',
      stockCount: 22,
      imageUrl: '/src/assets/images/product_mineral_sunscreen_1793111028905.jpg',
      category: CategoryModel(id: 4, name: 'Sun Care', slug: 'sun-care'),
    ),

    // Skincare
    const ProductModel(
      id: 'sg-skin-01',
      name: 'Ceramide Barrier Recovery Cream',
      subtitle: 'Rich Biomimetic Moisture Shield',
      slug: 'ceramide-barrier-recovery-cream',
      price: 44.0,
      rating: 4.8,
      reviewsCount: 167,
      skinTypes: ['Dry', 'Sensitive', 'Normal'],
      skinConcerns: ['Dehydration', 'Redness'],
      keyIngredients: ['3:1:1 Physiological Lipid Complex', 'Colloidal Oat Flour', 'Squalane'],
      allIngredients:
          'Aqua, Squalane, Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Ceramide NP, Cholesterol, Free Fatty Acids, Avena Sativa.',
      description:
          'A deeply comforting lipid-replenishing moisture cream mimicking the natural intercellular matrix to seal transepidermal water loss and protect irritated skin.',
      benefits: [
        'Clinically formulated 3:1:1 ratio of ceramides, cholesterol, and fatty acids',
        'Restores suppleness and relief within 24 hours of use',
        'Free from artificial fragrances, essential oils, and parabens',
      ],
      usage: 'Warm a pea-sized amount between fingertips and press into face and neck morning and night.',
      volume: '50 ml / 1.7 fl oz',
      stockCount: 31,
      imageUrl: '/src/assets/images/hero_smartglow_cosmetics_1793111027189.jpg',
      tag: 'Dermatologist Tested',
      category: CategoryModel(id: 1, name: 'Skincare', slug: 'skincare'),
    ),
    const ProductModel(
      id: 'sg-skin-02',
      name: 'Overnight Resurfacing AHA/BHA Balm',
      subtitle: '8% Lactic Acid & Gentle Willow Bark',
      slug: 'overnight-resurfacing-aha-bha-balm',
      price: 46.0,
      rating: 4.7,
      reviewsCount: 92,
      skinTypes: ['Combination', 'Oily', 'Normal'],
      skinConcerns: ['Dullness', 'Hyperpigmentation', 'Fine Lines'],
      keyIngredients: ['8% Vegan Lactic Acid', 'Willow Bark Extract', 'Niacinamide'],
      allIngredients:
          'Aqua, Lactic Acid, Propanediol, Salix Alba (Willow) Bark Extract, Niacinamide, Sodium Hyaluronate, Hydroxyethylcellulose, Phenoxyethanol.',
      description:
          'A nocturnal gentle peeling cream that dissolves sluggish surface keratinocytes overnight to reveal refined, glowing, and silky smooth skin by sunrise.',
      benefits: [
        'Exfoliates dead surface cells without micro-tears or stinging',
        'Fades post-blemish discoloration with consistent nocturnal use',
        'Infused with moisture-retaining humectants to prevent dryness',
      ],
      usage:
          'Apply 2–3 pumps at night onto clean, dry face. Use 2–3 times weekly. Always follow with daytime SPF 50.',
      volume: '50 ml / 1.7 fl oz',
      stockCount: 18,
      imageUrl: '/src/assets/images/hero_smartglow_cosmetics_1793111027189.jpg',
      category: CategoryModel(id: 1, name: 'Skincare', slug: 'skincare'),
    ),

    // Makeup
    const ProductModel(
      id: 'sg-make-01',
      name: 'Luminous Sheer Dewy Skin Tint',
      subtitle: 'Hyaluronic Infused Breathable Glow',
      slug: 'luminous-sheer-dewy-skin-tint',
      price: 38.0,
      rating: 4.9,
      reviewsCount: 230,
      skinTypes: ['All', 'Dry', 'Normal', 'Combination'],
      skinConcerns: ['Dullness', 'Dehydration'],
      keyIngredients: ['Multi-Weight Hyaluronic Acid', 'Rose Glow Mineral Mica', 'Marula Oil'],
      allIngredients:
          'Aqua, Hydrogenated Ethylhexyl Olivate, Mica, Glycerin, Sclerocarya Birrea Seed Oil, Sodium Hyaluronate, CI 77891, CI 77491, CI 77492, CI 77499.',
      description:
          'A hybrid skincare-makeup tint delivering buildable sheer-to-medium coverage with a lit-from-within second-skin satin luminosity.',
      benefits: [
        'Non-comedogenic formula lets pores breathe freely throughout the day',
        'Infused with skincare-grade humectants for 12-hour continuous hydration',
        'Adapts seamlessly across complexion nuances',
      ],
      usage:
          'Shake well. Dispense 1–2 drops on cheeks and forehead, blending smoothly with fingertips or damp sponge for a fresh glow.',
      volume: '30 ml / 1.0 fl oz',
      stockCount: 36,
      imageUrl: '/src/assets/images/product_dewy_tint_1793111029554.jpg',
      tag: 'Award Winner',
      category: CategoryModel(id: 5, name: 'Makeup', slug: 'makeup'),
    ),
    const ProductModel(
      id: 'sg-make-02',
      name: 'Botanical Lip & Cheek Flush',
      subtitle: 'Sheer Hydrating Peptide Balm',
      slug: 'botanical-lip-cheek-flush',
      price: 24.0,
      rating: 4.8,
      reviewsCount: 154,
      skinTypes: ['All', 'Sensitive'],
      skinConcerns: ['Dehydration'],
      keyIngredients: ['Palmitoyl Tripeptide-38', 'Organic Jojoba Seed Oil', 'Vitamin E'],
      allIngredients:
          'Ricinus Communis Seed Oil, Simmondsia Chinensis Seed Oil, Cera Alba, Palmitoyl Tripeptide-38, Tocopherol, Iron Oxides, CI 15850.',
      description:
          'A multi-use dewy color balm for cheeks and lips melting effortlessly upon skin contact to impart a natural, healthy flush of radiant color.',
      benefits: [
        'Dual-purpose tint for rapid morning minimalist beauty routines',
        'Plumps and hydrates dry lips with biomimetic peptide technology',
        'Pocket-friendly chic frosted glass container',
      ],
      usage: 'Dab gently onto apples of cheeks and tap into lips using ring finger. Layer for intensified pigment.',
      volume: '10 g / 0.35 oz',
      stockCount: 40,
      imageUrl: '/src/assets/images/product_dewy_tint_1793111029554.jpg',
      category: CategoryModel(id: 5, name: 'Makeup', slug: 'makeup'),
    ),
  ];
}
