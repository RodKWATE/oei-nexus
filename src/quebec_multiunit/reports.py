from datetime import datetime
import pandas as pd

class ReportGenerator:
    def __init__(self, analysis_results):
        self.analysis_results = analysis_results

    def generate_summary_report(self):
        summary = {
            "Total Properties": len(self.analysis_results),
            "Average Score": self.calculate_average_score(),
            "Best Investment": self.get_best_investment(),
            "Worst Investment": self.get_worst_investment(),
            "Generated On": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        return summary

    def calculate_average_score(self):
        scores = [result['score'] for result in self.analysis_results]
        return sum(scores) / len(scores) if scores else 0

    def get_best_investment(self):
        best_investment = max(self.analysis_results, key=lambda x: x['score'], default=None)
        return best_investment

    def get_worst_investment(self):
        worst_investment = min(self.analysis_results, key=lambda x: x['score'], default=None)
        return worst_investment

    def save_report_to_csv(self, report, filename='investment_report.csv'):
        df = pd.DataFrame([report])
        df.to_csv(filename, index=False)

    def save_detailed_report(self, filename='detailed_report.csv'):
        df = pd.DataFrame(self.analysis_results)
        df.to_csv(filename, index=False)

# Example usage:
# results = [{'property_id': 1, 'score': 85}, {'property_id': 2, 'score': 90}]
# report_gen = ReportGenerator(results)
# summary = report_gen.generate_summary_report()
# report_gen.save_report_to_csv(summary)
# report_gen.save_detailed_report()