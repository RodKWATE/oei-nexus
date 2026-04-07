def analyze_property(property_data):
    """
    Analyzes a multi-unit residential property based on provided data.

    Parameters:
    property_data (dict): A dictionary containing property details such as
                          purchase price, rental income, expenses, etc.

    Returns:
    dict: A dictionary containing analysis results including cash flow,
          return on investment (ROI), and other financial metrics.
    """
    purchase_price = property_data.get('purchase_price', 0)
    rental_income = property_data.get('rental_income', 0)
    expenses = property_data.get('expenses', 0)
    
    cash_flow = rental_income - expenses
    roi = (cash_flow / purchase_price) * 100 if purchase_price > 0 else 0

    analysis_results = {
        'cash_flow': cash_flow,
        'roi': roi,
        'purchase_price': purchase_price,
        'rental_income': rental_income,
        'expenses': expenses
    }

    return analysis_results

def generate_scenario_analysis(property_data, scenarios):
    """
    Generates scenario analysis for different investment strategies.

    Parameters:
    property_data (dict): A dictionary containing property details.
    scenarios (list): A list of dictionaries, each representing a different scenario.

    Returns:
    list: A list of analysis results for each scenario.
    """
    results = []
    for scenario in scenarios:
        scenario_data = {**property_data, **scenario}
        analysis_result = analyze_property(scenario_data)
        results.append(analysis_result)
    
    return results

def investment_score(analysis_results):
    """
    Scores the investment based on analysis results.

    Parameters:
    analysis_results (dict): A dictionary containing analysis results.

    Returns:
    int: A score representing the investment attractiveness.
    """
    score = 0
    if analysis_results['roi'] > 10:
        score += 2
    elif analysis_results['roi'] > 5:
        score += 1

    if analysis_results['cash_flow'] > 0:
        score += 2

    return score

def generate_report(analysis_results):
    """
    Generates a report based on the analysis results.

    Parameters:
    analysis_results (dict): A dictionary containing analysis results.

    Returns:
    str: A formatted report string.
    """
    report = f"Property Analysis Report:\n"
    report += f"Purchase Price: ${analysis_results['purchase_price']}\n"
    report += f"Rental Income: ${analysis_results['rental_income']}\n"
    report += f"Expenses: ${analysis_results['expenses']}\n"
    report += f"Cash Flow: ${analysis_results['cash_flow']}\n"
    report += f"ROI: {analysis_results['roi']:.2f}%\n"
    report += f"Investment Score: {investment_score(analysis_results)}\n"
    
    return report