from quebec_multiunit.finance import calculate_roi, calculate_cash_flow

def test_calculate_roi():
    # Test case for ROI calculation
    purchase_price = 500000
    rental_income = 60000
    expenses = 12000
    expected_roi = (rental_income - expenses) / purchase_price
    assert calculate_roi(purchase_price, rental_income, expenses) == expected_roi

def test_calculate_cash_flow():
    # Test case for cash flow calculation
    rental_income = 60000
    expenses = 12000
    expected_cash_flow = rental_income - expenses
    assert calculate_cash_flow(rental_income, expenses) == expected_cash_flow

def test_calculate_roi_negative():
    # Test case for ROI calculation with negative cash flow
    purchase_price = 500000
    rental_income = 30000
    expenses = 40000
    expected_roi = (rental_income - expenses) / purchase_price
    assert calculate_roi(purchase_price, rental_income, expenses) == expected_roi

def test_calculate_cash_flow_zero_income():
    # Test case for cash flow calculation with zero income
    rental_income = 0
    expenses = 12000
    expected_cash_flow = rental_income - expenses
    assert calculate_cash_flow(rental_income, expenses) == expected_cash_flow

def test_calculate_roi_zero_expenses():
    # Test case for ROI calculation with zero expenses
    purchase_price = 500000
    rental_income = 60000
    expenses = 0
    expected_roi = rental_income / purchase_price
    assert calculate_roi(purchase_price, rental_income, expenses) == expected_roi