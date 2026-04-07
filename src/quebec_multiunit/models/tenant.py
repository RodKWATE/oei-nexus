class Tenant:
    def __init__(self, name, age, income, lease_start, lease_end):
        self.name = name
        self.age = age
        self.income = income
        self.lease_start = lease_start
        self.lease_end = lease_end

    def is_lease_active(self, current_date):
        return self.lease_start <= current_date <= self.lease_end

    def __repr__(self):
        return f"Tenant(name={self.name}, age={self.age}, income={self.income}, lease_start={self.lease_start}, lease_end={self.lease_end})"