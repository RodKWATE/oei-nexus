from quebec_multiunit.scenarios import ScenarioAnalyzer
import pytest

@pytest.fixture
def scenario_analyzer():
    return ScenarioAnalyzer()

def test_scenario_analysis_basic(scenario_analyzer):
    result = scenario_analyzer.analyze_scenario(investment_amount=100000, rental_income=12000, expenses=3000)
    assert result['cash_flow'] == 9000
    assert result['roi'] == 0.09

def test_scenario_analysis_high_expenses(scenario_analyzer):
    result = scenario_analyzer.analyze_scenario(investment_amount=100000, rental_income=12000, expenses=10000)
    assert result['cash_flow'] == 2000
    assert result['roi'] == 0.02

def test_scenario_analysis_no_income(scenario_analyzer):
    result = scenario_analyzer.analyze_scenario(investment_amount=100000, rental_income=0, expenses=3000)
    assert result['cash_flow'] == -3000
    assert result['roi'] == -0.03

def test_scenario_analysis_zero_investment(scenario_analyzer):
    result = scenario_analyzer.analyze_scenario(investment_amount=0, rental_income=12000, expenses=3000)
    assert result['cash_flow'] == 9000
    assert result['roi'] == float('inf')  # ROI is infinite if investment is zero

def test_scenario_analysis_negative_investment(scenario_analyzer):
    result = scenario_analyzer.analyze_scenario(investment_amount=-50000, rental_income=12000, expenses=3000)
    assert result['cash_flow'] == 9000
    assert result['roi'] == -0.18  # ROI calculation should handle negative investment