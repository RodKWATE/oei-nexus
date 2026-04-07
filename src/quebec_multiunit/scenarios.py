from typing import List, Dict

class ScenarioAnalyzer:
    def __init__(self, property_data: Dict, market_data: Dict):
        self.property_data = property_data
        self.market_data = market_data

    def analyze_cash_flow(self, rent_increase: float, expense_increase: float) -> Dict[str, float]:
        cash_flow = {
            "current": self.property_data["monthly_rent"] - self.property_data["monthly_expenses"],
            "projected": (self.property_data["monthly_rent"] * (1 + rent_increase)) - (self.property_data["monthly_expenses"] * (1 + expense_increase))
        }
        return cash_flow

    def evaluate_appreciation(self, years: int, annual_appreciation_rate: float) -> float:
        future_value = self.property_data["purchase_price"] * ((1 + annual_appreciation_rate) ** years)
        return future_value

    def scenario_analysis(self, scenarios: List[Dict[str, float]]) -> List[Dict[str, float]]:
        results = []
        for scenario in scenarios:
            cash_flow = self.analyze_cash_flow(scenario["rent_increase"], scenario["expense_increase"])
            appreciation = self.evaluate_appreciation(scenario["years"], scenario["annual_appreciation_rate"])
            results.append({
                "cash_flow": cash_flow,
                "appreciation": appreciation
            })
        return results

    def generate_report(self, analysis_results: List[Dict[str, float]]) -> str:
        report = "Scenario Analysis Report\n"
        report += "=" * 30 + "\n"
        for index, result in enumerate(analysis_results):
            report += f"Scenario {index + 1}:\n"
            report += f"  Cash Flow: Current: {result['cash_flow']['current']}, Projected: {result['cash_flow']['projected']}\n"
            report += f"  Future Value: {result['appreciation']}\n\n"
        return report
