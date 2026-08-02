const WasteListing = require('../models/WasteListing');
const User = require('../models/User');
const BuyerRequest = require('../models/BuyerRequest');
const Transaction = require('../models/Transaction');
const AIRecommendation = require('../models/AIRecommendation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { groqJSON, groqVisionJSON } = require('../config/groq');
const { getDistanceKm, distanceScore } = require('../utils/geoUtils');

// ---------------------------------------------------------------------------
// 1. SMART WASTE CLASSIFICATION
// POST /api/ai/classify   body: { wasteId? , description, materialType, imageUrl? }
// ---------------------------------------------------------------------------
exports.classifyWaste = catchAsync(async (req, res, next) => {
  const { wasteId, description, materialType, imageUrl } = req.body;
  if (!description || !materialType) {
    return next(new AppError('description and materialType are required.', 400));
  }

  const system = `You are an industrial waste classification expert for a circular-economy marketplace.
Given a material description, return STRICT JSON with this exact shape and nothing else:
{
  "predictedCategory": one of ["Metal","Plastic","Paper","Textile","Chemical","Wood","Glass","Rubber","E-Waste","Organic","Construction","Other"],
  "recyclability": one of ["High","Medium","Low","Unknown"],
  "hazardLevel": one of ["None","Low","Medium","High","Unknown"],
  "confidence": number between 0 and 1,
  "reasoning": short 1-2 sentence explanation
}`;

  const userPrompt = `Material type: ${materialType}\nDescription: ${description}`;

  let result;
  if (imageUrl) {
    result = await groqVisionJSON({
      system,
      prompt: `Classify this industrial waste material.\n${userPrompt}\nReturn only the JSON object described in the system prompt.`,
      imageUrl,
    });
  } else {
    result = await groqJSON({ system, user: userPrompt });
  }

  if (wasteId) {
    const waste = await WasteListing.findById(wasteId);
    if (waste) {
      waste.aiClassification = {
        predictedCategory: result.predictedCategory,
        recyclability: result.recyclability,
        hazardLevel: result.hazardLevel,
        confidence: result.confidence,
        classifiedAt: new Date(),
      };
      await waste.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({ success: true, data: result });
});

// ---------------------------------------------------------------------------
// 2. BUYER RECOMMENDATION ENGINE
// GET /api/ai/recommendations/:wasteId
// Combines a deterministic scoring pass (distance, history, compatibility,
// quantity, price) with a Groq-generated natural-language explanation for
// the top candidates. Deterministic scoring keeps rankings stable/auditable;
// the LLM is used for reasoning/explanation, not the ranking math itself.
// ---------------------------------------------------------------------------
exports.getBuyerRecommendations = catchAsync(async (req, res, next) => {
  const waste = await WasteListing.findById(req.params.wasteId).populate('user');
  if (!waste) return next(new AppError('Waste listing not found.', 404));

  const candidateBuyers = await User.find({ role: 'buyer', isActive: true }).limit(200);
  if (candidateBuyers.length === 0) {
    return res.status(200).json({ success: true, results: 0, data: { recommendations: [] } });
  }

  const openRequests = await BuyerRequest.find({ status: 'open' });
  const pastTransactions = await Transaction.find({ seller: waste.user._id, status: 'completed' });

  const scored = candidateBuyers.map((buyer) => {
    const wasteCoords = waste.pickupLocation?.location?.coordinates;
    const buyerCoords = buyer.location?.coordinates;
    const distanceKm =
      wasteCoords && buyerCoords
        ? getDistanceKm(wasteCoords[1], wasteCoords[0], buyerCoords[1], buyerCoords[0])
        : null;
    const distScore = distanceScore(distanceKm ?? 9999);

    const historyCount = pastTransactions.filter((t) => t.buyer.toString() === buyer._id.toString()).length;
    const historyScore = Math.min(historyCount / 5, 1);

    const matchingRequest = openRequests.find(
      (r) => r.buyer.toString() === buyer._id.toString() &&
        (r.category === waste.category || new RegExp(r.materialType, 'i').test(waste.materialType))
    );
    const compatibilityScore = matchingRequest
      ? (matchingRequest.category === waste.category ? 1 : 0.6)
      : (buyer.industryType && waste.category && buyer.industryType.toLowerCase().includes(waste.category.toLowerCase()) ? 0.4 : 0.15);

    const quantityScore = matchingRequest
      ? Math.min(waste.quantity / Math.max(matchingRequest.quantityNeeded, 1), 1)
      : 0.5;

    const priceScore = matchingRequest?.maxBudget
      ? (waste.price <= matchingRequest.maxBudget ? 1 : Math.max(0, 1 - (waste.price - matchingRequest.maxBudget) / matchingRequest.maxBudget))
      : 0.5;

    const matchScore = Number(
      (distScore * 0.25 + historyScore * 0.15 + compatibilityScore * 0.3 + quantityScore * 0.15 + priceScore * 0.15).toFixed(3)
    );

    return {
      buyer,
      distanceKm,
      matchScore,
      scoreBreakdown: { distanceScore: distScore, historyScore, compatibilityScore, quantityScore, priceScore },
    };
  });

  const top = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

  // Ask Groq for a short human-readable rationale for the top matches (batched, one call)
  const system = `You are an AI matchmaking assistant for an industrial waste marketplace.
Given a waste listing and a list of candidate buyers with their computed match scores, write a short
1-sentence explanation for EACH buyer justifying why they are (or aren't strongly) a good match.
Return STRICT JSON only: { "explanations": [ { "buyerId": string, "explanation": string } ... ] }`;

  const user = JSON.stringify({
    waste: { category: waste.category, materialType: waste.materialType, quantity: waste.quantity, unit: waste.unit, price: waste.price },
    candidates: top.map((t) => ({
      buyerId: t.buyer._id.toString(),
      industryType: t.buyer.industryType,
      distanceKm: t.distanceKm,
      matchScore: t.matchScore,
      scoreBreakdown: t.scoreBreakdown,
    })),
  });

  let explanations = [];
  try {
    const aiResult = await groqJSON({ system, user, temperature: 0.4 });
    explanations = aiResult.explanations || [];
  } catch (e) {
    console.error('[AI] Recommendation explanation generation failed:', e.message);
  }

  const recommendations = top.map((t) => {
    const exp = explanations.find((e) => e.buyerId === t.buyer._id.toString());
    return {
      buyer: {
        _id: t.buyer._id,
        companyName: t.buyer.companyName,
        industryType: t.buyer.industryType,
        city: t.buyer.city,
        state: t.buyer.state,
        rating: t.buyer.rating,
      },
      distanceKm: t.distanceKm,
      matchScore: t.matchScore,
      scoreBreakdown: t.scoreBreakdown,
      aiExplanation: exp?.explanation || 'Match computed from distance, history, and material compatibility.',
    };
  });

  // Persist top recommendations for the dashboard "AI Suggestions" widget
  await Promise.all(
    recommendations.map((r) =>
      AIRecommendation.findOneAndUpdate(
        { waste: waste._id, recommendedBuyer: r.buyer._id },
        {
          waste: waste._id,
          recommendedBuyer: r.buyer._id,
          matchScore: r.matchScore,
          scoreBreakdown: r.scoreBreakdown,
          aiExplanation: r.aiExplanation,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      )
    )
  );

  res.status(200).json({ success: true, results: recommendations.length, data: { recommendations } });
});

// ---------------------------------------------------------------------------
// 3. PRICE PREDICTION
// POST /api/ai/price-predict
// ---------------------------------------------------------------------------
exports.predictPrice = catchAsync(async (req, res, next) => {
  const { category, materialType, quantity, unit, qualityGrade, city, state } = req.body;
  if (!category || !materialType || !quantity || !unit) {
    return next(new AppError('category, materialType, quantity, and unit are required.', 400));
  }

  // Ground the LLM with real comparable listings from our own DB when available
  const comparables = await WasteListing.find({ category, status: 'active' })
    .select('materialType price quantity unit qualityGrade')
    .limit(15)
    .lean();

  const system = `You are a market pricing analyst for an industrial waste exchange platform in India.
Estimate a fair market price per unit in INR for the given material, using the comparable listings as
reference where relevant, and general market knowledge otherwise. Return STRICT JSON only:
{
  "suggestedPrice": number (INR per unit),
  "priceRangeLow": number,
  "priceRangeHigh": number,
  "reasoning": short explanation referencing key factors (quality, quantity, comparables, location)
}`;

  const user = JSON.stringify({
    target: { category, materialType, quantity, unit, qualityGrade, city, state },
    comparables,
  });

  const result = await groqJSON({ system, user, temperature: 0.3 });

  res.status(200).json({ success: true, data: result });
});

// ---------------------------------------------------------------------------
// 4. WASTE GENERATION FORECAST
// POST /api/ai/forecast   body: { userId? (defaults to req.user), monthsAhead }
// ---------------------------------------------------------------------------
exports.forecastWaste = catchAsync(async (req, res, next) => {
  const userId = req.body.userId || req.user._id;
  const monthsAhead = Number(req.body.monthsAhead) || 3;

  const history = await WasteListing.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        totalQuantity: { $sum: '$quantity' },
        listingCount: { $sum: 1 },
        categories: { $addToSet: '$category' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  if (history.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        forecast: [],
        message: 'Not enough historical listing data yet to generate a forecast.',
      },
    });
  }

  const system = `You are a waste-generation forecasting analyst. Given monthly historical waste listing
volumes for one industry, project the next ${monthsAhead} months. Consider trend and any seasonality visible
in the data. Return STRICT JSON only:
{ "forecast": [ { "month": "YYYY-MM", "predictedQuantity": number, "confidence": number between 0 and 1 } ... ],
  "trendSummary": short explanation }`;

  const user = JSON.stringify({ monthlyHistory: history, monthsAhead });

  const result = await groqJSON({ system, user, temperature: 0.3 });

  res.status(200).json({ success: true, data: result });
});

// ---------------------------------------------------------------------------
// 5. CARBON SAVING CALCULATOR
// POST /api/ai/carbon   body: { category, quantity, unit }
// Deterministic formula-based calculation (auditable), not LLM-generated,
// since environmental claims need consistent, defensible numbers.
// Emission factors are illustrative approximations for an MSME demo context.
// ---------------------------------------------------------------------------
const EMISSION_FACTORS_CO2_PER_KG = {
  Metal: 1.8, Plastic: 1.5, Paper: 0.9, Textile: 1.2, Chemical: 1.0,
  Wood: 0.4, Glass: 0.3, Rubber: 1.3, 'E-Waste': 2.5, Organic: 0.2,
  Construction: 0.15, Other: 0.5,
};

exports.calculateCarbon = catchAsync(async (req, res, next) => {
  const { category, quantity, unit } = req.body;
  if (!category || !quantity || !unit) {
    return next(new AppError('category, quantity, and unit are required.', 400));
  }

  const unitToKg = { kg: 1, ton: 1000, litre: 1, piece: 1, cubic_meter: 1000 };
  const quantityKg = quantity * (unitToKg[unit] ?? 1);

  const factor = EMISSION_FACTORS_CO2_PER_KG[category] ?? EMISSION_FACTORS_CO2_PER_KG.Other;
  const co2SavedKg = Number((quantityKg * factor).toFixed(2));
  const treesEquivalent = Number((co2SavedKg / 21).toFixed(1)); // ~21kg CO2 absorbed per tree/year
  const landfillReductionKg = Number(quantityKg.toFixed(2));
  const energySavedKwh = Number((quantityKg * 0.6).toFixed(2)); // illustrative recycling energy-saving factor

  res.status(200).json({
    success: true,
    data: { co2SavedKg, treesEquivalent, landfillReductionKg, energySavedKwh },
  });
});

// ---------------------------------------------------------------------------
// 6. MATERIAL SIMILARITY MATCHING
// POST /api/ai/similar-materials   body: { wasteId }
// Uses text-index candidate retrieval + Groq re-ranking for semantic similarity
// (keeps this cheap: DB narrows candidates, LLM only judges the short list).
// ---------------------------------------------------------------------------
exports.findSimilarMaterials = catchAsync(async (req, res, next) => {
  const source = await WasteListing.findById(req.params.wasteId);
  if (!source) return next(new AppError('Waste listing not found.', 404));

  const candidates = await WasteListing.find({
    _id: { $ne: source._id },
    category: source.category,
    status: 'active',
  })
    .limit(20)
    .select('wasteName materialType description category quantity unit price')
    .lean();

  if (candidates.length === 0) {
    return res.status(200).json({ success: true, results: 0, data: { similar: [] } });
  }

  const system = `You match industrial waste materials by similarity (composition, reuse potential, processing
compatibility) - not just category. Given a source material and candidates, return STRICT JSON only:
{ "similar": [ { "id": string, "similarityScore": number 0-1, "reason": short phrase } ... ] }
Only include candidates with similarityScore >= 0.4, ordered highest first.`;

  const user = JSON.stringify({
    source: { materialType: source.materialType, description: source.description, category: source.category },
    candidates: candidates.map((c) => ({ id: c._id.toString(), materialType: c.materialType, description: c.description })),
  });

  const result = await groqJSON({ system, user, temperature: 0.3 });
  const idToScore = new Map((result.similar || []).map((s) => [s.id, s]));

  const similar = candidates
    .filter((c) => idToScore.has(c._id.toString()))
    .map((c) => ({ ...c, ...idToScore.get(c._id.toString()) }))
    .sort((a, b) => b.similarityScore - a.similarityScore);

  res.status(200).json({ success: true, results: similar.length, data: { similar } });
});

// ---------------------------------------------------------------------------
// 7. TRANSPORTATION OPTIMIZATION
// POST /api/ai/transport-optimize   body: { transactionId } OR { fromLat, fromLng, toLat, toLng }
// Deterministic distance/fuel/carbon estimate; LLM adds a brief route note.
// ---------------------------------------------------------------------------
exports.optimizeTransport = catchAsync(async (req, res, next) => {
  let { fromLat, fromLng, toLat, toLng, vehicleType = 'truck_small' } = req.body;

  if (req.body.transactionId) {
    const txn = await Transaction.findById(req.body.transactionId).populate('waste seller buyer');
    if (!txn) return next(new AppError('Transaction not found.', 404));
    const from = txn.waste?.pickupLocation?.location?.coordinates;
    const to = txn.buyer?.location?.coordinates;
    if (from) { fromLat = from[1]; fromLng = from[0]; }
    if (to) { toLat = to[1]; toLng = to[0]; }
  }

  if ([fromLat, fromLng, toLat, toLng].some((v) => v === undefined || v === null)) {
    return next(new AppError('Origin and destination coordinates are required.', 400));
  }

  const distanceKm = getDistanceKm(fromLat, fromLng, toLat, toLng);

  const FUEL_EFFICIENCY_KM_PER_L = { truck_small: 8, truck_medium: 5, truck_large: 3.5 };
  const CO2_PER_LITRE_DIESEL = 2.68; // kg CO2 per litre diesel burned

  const efficiency = FUEL_EFFICIENCY_KM_PER_L[vehicleType] ?? FUEL_EFFICIENCY_KM_PER_L.truck_small;
  const estimatedFuelLitres = Number((distanceKm / efficiency).toFixed(2));
  const estimatedCO2Kg = Number((estimatedFuelLitres * CO2_PER_LITRE_DIESEL).toFixed(2));

  res.status(200).json({
    success: true,
    data: {
      distanceKm,
      vehicleType,
      estimatedFuelLitres,
      estimatedCO2Kg,
      note: 'Straight-line (haversine) estimate. Integrate a routing provider (e.g. OSRM/Mapbox Directions) for turn-by-turn road distance.',
    },
  });
});
