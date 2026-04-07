def calculate_cash_flow(rental_income, operating_expenses, mortgage_payment):
    return rental_income - operating_expenses - mortgage_payment

def calculate_roi(cash_flow, total_investment):
    if total_investment == 0:
        return 0
    return (cash_flow / total_investment) * 100

def calculate_cap_rate(net_operating_income, property_value):
    if property_value == 0:
        return 0
    return (net_operating_income / property_value) * 100

def calculate_debt_service_coverage_ratio(net_operating_income, mortgage_payment):
    if mortgage_payment == 0:
        return 0
    return net_operating_income / mortgage_payment

def calculate_gross_rent_multiplier(property_value, gross_rental_income):
    if gross_rental_income == 0:
        return 0
    return property_value / gross_rental_income

def calculate_financial_metrics(rental_income, operating_expenses, mortgage_payment, property_value, total_investment):
    cash_flow = calculate_cash_flow(rental_income, operating_expenses, mortgage_payment)
    roi = calculate_roi(cash_flow, total_investment)
    net_operating_income = rental_income - operating_expenses
    cap_rate = calculate_cap_rate(net_operating_income, property_value)
    dscr = calculate_debt_service_coverage_ratio(net_operating_income, mortgage_payment)
    grm = calculate_gross_rent_multiplier(property_value, rental_income)

    return {
        "cash_flow": cash_flow,
        "roi": roi,
        "cap_rate": cap_rate,
        "dscr": dscr,
        "grm": grm
    }