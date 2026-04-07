from quebec_multiunit.scoring import InvestmentScoring

def test_investment_scoring():
    # Test case 1: Basic scoring
    property_data = {
        'purchase_price': 500000,
        'annual_rent': 60000,
        'annual_expenses': 12000,
        'vacancy_rate': 0.05,
        'appreciation_rate': 0.03,
        'investment_period': 10
    }
    
    scoring = InvestmentScoring(property_data)
    score = scoring.calculate_score()
    
    assert score is not None
    assert isinstance(score, float)

    # Test case 2: Edge case with zero rent
    property_data_zero_rent = {
        'purchase_price': 500000,
        'annual_rent': 0,
        'annual_expenses': 12000,
        'vacancy_rate': 0.05,
        'appreciation_rate': 0.03,
        'investment_period': 10
    }
    
    scoring_zero_rent = InvestmentScoring(property_data_zero_rent)
    score_zero_rent = scoring_zero_rent.calculate_score()
    
    assert score_zero_rent == 0.0

    # Test case 3: High expenses
    property_data_high_expenses = {
        'purchase_price': 500000,
        'annual_rent': 60000,
        'annual_expenses': 70000,
        'vacancy_rate': 0.05,
        'appreciation_rate': 0.03,
        'investment_period': 10
    }
    
    scoring_high_expenses = InvestmentScoring(property_data_high_expenses)
    score_high_expenses = scoring_high_expenses.calculate_score()
    
    assert score_high_expenses < 0.0

    # Test case 4: Long investment period
    property_data_long_period = {
        'purchase_price': 500000,
        'annual_rent': 60000,
        'annual_expenses': 12000,
        'vacancy_rate': 0.05,
        'appreciation_rate': 0.03,
        'investment_period': 30
    }
    
    scoring_long_period = InvestmentScoring(property_data_long_period)
    score_long_period = scoring_long_period.calculate_score()
    
    assert score_long_period > score  # Expecting a higher score for a longer investment period

    # Test case 5: Negative appreciation rate
    property_data_negative_appreciation = {
        'purchase_price': 500000,
        'annual_rent': 60000,
        'annual_expenses': 12000,
        'vacancy_rate': 0.05,
        'appreciation_rate': -0.03,
        'investment_period': 10
    }
    
    scoring_negative_appreciation = InvestmentScoring(property_data_negative_appreciation)
    score_negative_appreciation = scoring_negative_appreciation.calculate_score()
    
    assert score_negative_appreciation < score  # Expecting a lower score due to negative appreciation