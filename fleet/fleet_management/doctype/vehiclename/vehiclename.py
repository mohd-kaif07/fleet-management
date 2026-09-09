# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe

import frappe
from frappe.model.document import Document


class VehicleName(Document):

    def validate(self):
        self.validate_vehicle_name()
        self.validate_capacity()
        self.validate_fuel_type()
        self.validate_status()

    def validate_vehicle_name(self):
        if not self.vehicle_name:
            frappe.throw("Vehicle Name is required.")

        self.vehicle_name = self.vehicle_name.strip()

        if len(self.vehicle_name) < 3:
            frappe.throw(
                "Vehicle Name must be at least 3 characters long."
            )

    def validate_capacity(self):

        if self.capacity is None or self.capacity == "":
            frappe.throw("Capacity is required.")

        try:
            capacity = float(self.capacity)
        except (ValueError, TypeError):
            frappe.throw("Please enter a valid capacity.")

        # Negative value
        if capacity < 0:
            frappe.throw(
                "Negative capacity allowed nahi hai. "
                "Please positive value enter karein."
            )

        # Zero value
        if capacity == 0:
            frappe.throw(
                "Capacity 0 nahi ho sakti. "
                "Please positive value enter karein."
            )

        # Vehicle ki exact capacity
        limits = {
            "bike": 2,
            "car": 8,
            "bus": 40,
            "truck": 10
        }

        vehicle_name = self.vehicle_name.lower()

        # Automatically vehicle type identify karo
        vehicle_type = None

        for vehicle in limits:
            if vehicle in vehicle_name:
                vehicle_type = vehicle
                break

        # Agar vehicle type identify nahi hua
        if not vehicle_type:
            return

        required_capacity = limits[vehicle_type]

        # Exact capacity required
        if capacity != required_capacity:
            frappe.throw(
                f"""
                <b>Capacity Alert!</b><br><br>
                Vehicle: <b>{self.vehicle_name}</b><br>
                Required Capacity: <b>{required_capacity}</b><br>
                Your Capacity: <b>{capacity}</b><br><br>
                Please capacity ko <b>{required_capacity}</b> karein.
                """
            )

    def validate_fuel_type(self):
        if not self.fuel_type:
            frappe.throw(
                "Please select Fuel Type."
            )

    def validate_status(self):
        if not self.status:
            frappe.throw(
                "Vehicle Name must be Active. Inactive Vehicle Name cannot be saved."
            )        
