import { PricingCalculation } from '../types';

export function calculateSellingPrice(
  costPrice: number,
  fixedCostsPercent: number,
  variableCostsPercent: number,
  cardFeePercent: number,
  desiredProfitMarginPercent: number,
  monthlyFixedCosts = 0
): PricingCalculation {
  const totalDeductionPercent =
    fixedCostsPercent + variableCostsPercent + cardFeePercent + desiredProfitMarginPercent;

  // Prevent division by zero or negative denominator
  const divisor = 1 - totalDeductionPercent / 100;
  
  let suggestedSellingPrice = 0;
  let markupMultiplier = 0;

  if (divisor > 0.01 && costPrice > 0) {
    suggestedSellingPrice = costPrice / divisor;
    markupMultiplier = suggestedSellingPrice / costPrice;
  } else {
    // Fallback simple markup if sum of percentages >= 100%
    suggestedSellingPrice = costPrice * (1 + (desiredProfitMarginPercent || 30) / 100);
    markupMultiplier = costPrice > 0 ? suggestedSellingPrice / costPrice : 1;
  }

  const fixedCostAmount = (suggestedSellingPrice * fixedCostsPercent) / 100;
  const variableCostAmount = (suggestedSellingPrice * variableCostsPercent) / 100;
  const cardFeeAmount = (suggestedSellingPrice * cardFeePercent) / 100;
  
  const grossMarginAmount = suggestedSellingPrice - costPrice;
  const totalCostsAndFees = costPrice + fixedCostAmount + variableCostAmount + cardFeeAmount;
  const netProfitAmount = suggestedSellingPrice - totalCostsAndFees;
  const netProfitPercent = suggestedSellingPrice > 0 ? (netProfitAmount / suggestedSellingPrice) * 100 : 0;

  // Break-even analysis
  const contributionMarginRatio = suggestedSellingPrice > 0 
    ? (suggestedSellingPrice - costPrice - variableCostAmount - cardFeeAmount) / suggestedSellingPrice 
    : 0;

  let breakEvenRevenue = 0;
  let breakEvenUnits = 0;

  if (contributionMarginRatio > 0 && monthlyFixedCosts > 0) {
    breakEvenRevenue = monthlyFixedCosts / contributionMarginRatio;
    const unitContribution = suggestedSellingPrice - costPrice - variableCostAmount - cardFeeAmount;
    breakEvenUnits = unitContribution > 0 ? Math.ceil(monthlyFixedCosts / unitContribution) : 0;
  }

  return {
    costPrice,
    fixedCostsPercent,
    variableCostsPercent,
    cardFeePercent,
    desiredProfitMarginPercent,
    suggestedSellingPrice,
    markupMultiplier,
    grossMarginAmount,
    netProfitAmount,
    netProfitPercent,
    breakEvenMonthlyFixedCost: monthlyFixedCosts,
    breakEvenUnits,
    breakEvenRevenue,
  };
}

export interface CardSimulationInstallment {
  installments: number;
  ratePercent: number;
  installmentValueCustomerPays: number;
  totalCustomerPays: number;
  feeAmountMerchantPays: number;
  netMerchantReceives: number;
  // Repasse ao cliente
  passedPriceTotal: number;
  passedInstallmentValue: number;
}

export function simulateCardRates(
  amount: number,
  debitRate = 1.99,
  creditCashRate = 3.49,
  ratesPerInstallment: Record<number, number> = {}
): CardSimulationInstallment[] {
  const results: CardSimulationInstallment[] = [];

  // Default rates if not provided
  const defaultRates: Record<number, number> = {
    1: creditCashRate,
    2: 5.4,
    3: 6.2,
    4: 7.0,
    5: 7.8,
    6: 8.5,
    7: 9.4,
    8: 10.2,
    9: 11.0,
    10: 11.8,
    11: 12.5,
    12: 13.2,
    ...ratesPerInstallment,
  };

  for (let i = 1; i <= 12; i++) {
    const rate = defaultRates[i] || creditCashRate + (i - 1) * 0.9;
    
    // Scenario 1: Merchant absorbs fee
    const feeAmount = (amount * rate) / 100;
    const netMerchant = amount - feeAmount;
    const installmentValue = amount / i;

    // Scenario 2: Pass fee to customer (so merchant receives exact original amount)
    const passedTotal = amount / (1 - rate / 100);
    const passedInstallment = passedTotal / i;

    results.push({
      installments: i,
      ratePercent: rate,
      installmentValueCustomerPays: installmentValue,
      totalCustomerPays: amount,
      feeAmountMerchantPays: feeAmount,
      netMerchantReceives: netMerchant,
      passedPriceTotal: passedTotal,
      passedInstallmentValue: passedInstallment,
    });
  }

  return results;
}

export interface DiscountImpactResult {
  originalPrice: number;
  costPrice: number;
  discountPercent: number;
  discountedPrice: number;
  originalGrossMargin: number;
  originalGrossMarginPercent: number;
  newGrossMargin: number;
  newGrossMarginPercent: number;
  requiredSalesVolumeIncreasePercent: number;
}

export function calculateDiscountImpact(
  originalPrice: number,
  costPrice: number,
  discountPercent: number
): DiscountImpactResult {
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const originalGrossMargin = originalPrice - costPrice;
  const originalGrossMarginPercent = originalPrice > 0 ? (originalGrossMargin / originalPrice) * 100 : 0;
  
  const newGrossMargin = discountedPrice - costPrice;
  const newGrossMarginPercent = discountedPrice > 0 ? (newGrossMargin / discountedPrice) * 100 : 0;

  // How many more units to sell to make same total gross profit:
  // VolumeIncrease = (OriginalMargin / NewMargin - 1) * 100
  let requiredSalesVolumeIncreasePercent = 0;
  if (newGrossMargin > 0 && originalGrossMargin > 0) {
    requiredSalesVolumeIncreasePercent = ((originalGrossMargin / newGrossMargin) - 1) * 100;
  }

  return {
    originalPrice,
    costPrice,
    discountPercent,
    discountedPrice,
    originalGrossMargin,
    originalGrossMarginPercent,
    newGrossMargin,
    newGrossMarginPercent,
    requiredSalesVolumeIncreasePercent,
  };
}
