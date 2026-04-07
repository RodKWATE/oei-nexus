class Property:
    def __init__(self, address, purchase_price, rental_income, expenses, units):
        self.address = address
        self.purchase_price = purchase_price
        self.rental_income = rental_income
        self.expenses = expenses
        self.units = units

    def cash_flow(self):
        return self.rental_income - self.expenses

    def cap_rate(self):
        return (self.cash_flow() * 12) / self.purchase_price * 100

    def gross_rental_yield(self):
        return (self.rental_income * 12) / self.purchase_price * 100

    def net_operating_income(self):
        return self.rental_income - self.expenses

    def __repr__(self):
        return f"<Property(address={self.address}, purchase_price={self.purchase_price}, rental_income={self.rental_income}, expenses={self.expenses}, units={self.units})>"