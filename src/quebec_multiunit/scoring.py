def calculate_investment_score(property_data):
    score = 0
    # Example scoring criteria
    if property_data['cash_flow'] > 0:
        score += 10
    if property_data['appreciation_rate'] > 0.05:
        score += 5
    if property_data['location_score'] > 7:
        score += 5
    if property_data['occupancy_rate'] > 0.9:
        score += 5
    return score

def evaluate_investment(properties):
    scores = {}
    for property_id, data in properties.items():
        scores[property_id] = calculate_investment_score(data)
    return scores

def rank_investments(scores):
    ranked_properties = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return ranked_properties

def generate_investment_report(ranked_properties):
    report = "Investment Scoring Report\n"
    report += "=" * 30 + "\n"
    for property_id, score in ranked_properties:
        report += f"Property ID: {property_id}, Score: {score}\n"
    return report