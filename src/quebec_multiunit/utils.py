def calculate_roi(investment, return_value):
    if investment <= 0:
        raise ValueError("Investment must be greater than zero.")
    return (return_value - investment) / investment * 100

def calculate_cash_flow(rental_income, expenses):
    return rental_income - expenses

def format_currency(value):
    return "${:,.2f}".format(value)

def parse_csv_to_dict(file_path):
    import csv
    with open(file_path, mode='r') as file:
        reader = csv.DictReader(file)
        return [row for row in reader]

def validate_property_data(property_data):
    required_fields = ['address', 'purchase_price', 'rental_income', 'expenses']
    for field in required_fields:
        if field not in property_data:
            raise ValueError(f"Missing required field: {field}")
    return True

def generate_report(data):
    report = "Property Analysis Report\n"
    report += "=" * 30 + "\n"
    for item in data:
        report += f"Address: {item['address']}\n"
        report += f"ROI: {format_currency(calculate_roi(float(item['purchase_price']), float(item['rental_income'])))}\n"
        report += f"Cash Flow: {format_currency(calculate_cash_flow(float(item['rental_income']), float(item['expenses'])))}\n"
        report += "-" * 30 + "\n"
    return report