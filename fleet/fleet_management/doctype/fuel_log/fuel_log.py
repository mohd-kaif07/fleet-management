# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt
# import frappe
# from frappe.model.document import Document
# from frappe.utils import getdate, add_days


# class FuelLog(Document):

#     def validate(self):
#         self.validate_values()
#         self.set_previous_odometer()
#         self.validate_odometer()
#         self.calculate_values()

#     def validate_values(self):
#         # Required numeric validations
#         if self.liters_filled <= 0:
#             frappe.throw("Liters Filled must be greater than 0.")

#         if self.fuel_rate <= 0:
#             frappe.throw("Fuel Rate must be greater than 0.")

#         if self.odometer_at_fill < 0:
#             frappe.throw("Odometer At Fill cannot be negative.")

#         # Fuel date validation
#         if not self.fuel_date:
#             frappe.throw("Fuel Date is required.")

#         fuel_date = getdate(self.fuel_date)
#         today = getdate()

#         # Future date not allowed
#         if fuel_date > today:
#             frappe.throw("Fuel Date cannot be a future date.")

#         # Only last 10 days allowed
#         minimum_date = add_days(today, -10)

#         if fuel_date < minimum_date:
#             frappe.throw(
#                 f"Fuel Date must be between "
#                 f"{minimum_date.strftime('%d-%m-%Y')} and "
#                 f"{today.strftime('%d-%m-%Y')}."
#             )

#     def set_previous_odometer(self):
#         """
#         Get the latest previous fuel entry for the same vehicle
#         before the current Fuel Date.
#         """

#         previous = frappe.db.sql("""
#             SELECT odometer_at_fill
#             FROM `tabFuel Log`
#             WHERE vehicle = %s
#               AND name != %s
#               AND docstatus < 2
#               AND fuel_date <= %s
#             ORDER BY fuel_date DESC, creation DESC
#             LIMIT 1
#         """, (
#             self.vehicle,
#             self.name or "",
#             self.fuel_date
#         ), as_dict=True)

#         self.previous_odometer = (
#             previous[0].odometer_at_fill
#             if previous
#             else 0
#         )

#     def validate_odometer(self):
#         if (
#             self.previous_odometer
#             and self.odometer_at_fill < self.previous_odometer
#         ):
#             frappe.throw(
#                 f"Odometer At Fill ({self.odometer_at_fill}) "
#                 f"cannot be less than Previous Odometer "
#                 f"({self.previous_odometer})."
#             )

#     def calculate_values(self):
#         # Total Cost
#         self.total_cost = (
#             self.liters_filled * self.fuel_rate
#         )

#         # Distance Travelled
#         self.distance_travelled = (
#             self.odometer_at_fill -
#             self.previous_odometer
#         )

#         # Fuel Efficiency - KM/L
#         if self.liters_filled > 0:
#             self.fuel_efficiency = (
#                 self.distance_travelled /
#                 self.liters_filled
#             )
#         else:
#             self.fuel_efficiency = 0

#         # Cost Per KM
#         if self.distance_travelled > 0:
#             self.cost_per_km = (
#                 self.total_cost /
#                 self.distance_travelled
#             )
#         else:
#             self.cost_per_km = 0

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, add_days


class FuelLog(Document):

    def validate(self):
        self.validate_values()
        self.validate_trip_vehicle()
        self.set_previous_odometer()
        self.validate_odometer()
        self.calculate_values()

    def validate_values(self):

        # Required numeric validations
        if self.liters_filled <= 0:
            frappe.throw(
                "Liters Filled must be greater than 0."
            )

        if self.fuel_rate <= 0:
            frappe.throw(
                "Fuel Rate must be greater than 0."
            )

        if self.odometer_at_fill < 0:
            frappe.throw(
                "Odometer At Fill cannot be negative."
            )

        # Fuel date validation
        if not self.fuel_date:
            frappe.throw(
                "Fuel Date is required."
            )

        fuel_date = getdate(self.fuel_date)
        today = getdate()

        # Future date not allowed
        if fuel_date > today:
            frappe.throw(
                "Fuel Date cannot be a future date."
            )

        # Only last 10 days allowed
        minimum_date = add_days(today, -9)

        if fuel_date < minimum_date:
            frappe.throw(
                f"Fuel Date must be between "
                f"{minimum_date.strftime('%d-%m-%Y')} and "
                f"{today.strftime('%d-%m-%Y')}."
            )


    def validate_trip_vehicle(self):
        """
        Check that selected Trip belongs to selected Vehicle.
        """

        # Trip optional hai
        if not self.trip:
            return

        # Vehicle required hai
        if not self.vehicle:
            frappe.throw(
                "Please select a Vehicle before selecting a Trip."
            )

        # Trip se vehicle nikalo
        trip_vehicle = frappe.db.get_value(
            "Trip",
            self.trip,
            "vehicle"
        )

        # Trip me vehicle assigned nahi hai
        if not trip_vehicle:
            frappe.throw(
                f"Trip {self.trip} does not have a Vehicle assigned."
            )

        # Selected Vehicle aur Trip Vehicle match nahi
        if trip_vehicle != self.vehicle:
            frappe.throw(
                f"Trip {self.trip} does not belong to "
                f"Vehicle {self.vehicle}."
            )


    def set_previous_odometer(self):
        """
        Get the latest previous fuel entry
        for the same vehicle before/current Fuel Date.
        """

        previous = frappe.db.sql(
            """
            SELECT odometer_at_fill
            FROM `tabFuel Log`
            WHERE vehicle = %s
              AND name != %s
              AND docstatus < 2
              AND fuel_date <= %s
            ORDER BY fuel_date DESC, creation DESC
            LIMIT 1
            """,
            (
                self.vehicle,
                self.name or "",
                self.fuel_date
            ),
            as_dict=True
        )

        self.previous_odometer = (
            previous[0].odometer_at_fill
            if previous
            else 0
        )


    def validate_odometer(self):

        if (
            self.previous_odometer
            and self.odometer_at_fill < self.previous_odometer
        ):
            frappe.throw(
                f"Odometer At Fill ({self.odometer_at_fill}) "
                f"cannot be less than Previous Odometer "
                f"({self.previous_odometer})."
            )


    def calculate_values(self):

        # Total Cost
        self.total_cost = (
            self.liters_filled *
            self.fuel_rate
        )

        # Distance Travelled
        self.distance_travelled = (
            self.odometer_at_fill -
            self.previous_odometer
        )

        # Fuel Efficiency - KM/L
        if self.liters_filled > 0:

            self.fuel_efficiency = (
                self.distance_travelled /
                self.liters_filled
            )

        else:

            self.fuel_efficiency = 0

        # Cost Per KM
        if self.distance_travelled > 0:

            self.cost_per_km = (
                self.total_cost /
                self.distance_travelled
            )

        else:

            self.cost_per_km = 0
