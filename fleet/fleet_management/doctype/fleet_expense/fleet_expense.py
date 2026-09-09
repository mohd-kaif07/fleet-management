# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
# import frappe
# from frappe.model.document import Document


# class FleetExpense(Document):

#     def validate(self):
#         self.validate_amount()
#         self.validate_expense_date()
#         self.validate_required_fields()

#     def validate_amount(self):

#         if self.amount is None:
#             frappe.throw("Amount is required.")

#         if self.amount <= 0:
#             frappe.throw("Amount must be greater than 0.")

#     def validate_expense_date(self):

#         if not self.expense_date:
#             frappe.throw("Expense Date is required.")

#         today = frappe.utils.getdate(
#             frappe.utils.nowdate()
#         )

#         expense_date = frappe.utils.getdate(
#             self.expense_date
#         )

#         if expense_date > today:
#             frappe.throw(
#                 "Expense Date cannot be in the future."
#             )

#     def validate_required_fields(self):

#         if not self.vehicle:
#             frappe.throw("Vehicle is required.")

#         if not self.expense_type:
#             frappe.throw("Expense Type is required.")

#         if not self.payment_mode:
#             frappe.throw("Payment Mode is required.")

import frappe
from frappe.model.document import Document
from frappe.utils import today


class FleetExpense(Document):

    def validate(self):
        self.validate_expense_date()
        self.validate_amount()
        self.validate_trip_vehicle()
        self.validate_duplicate_expense()

    def validate_expense_date(self):
        """Expense date must be today's date."""

        if not self.expense_date:
            frappe.throw("Expense Date is required.")

        if self.expense_date != today():
            frappe.throw(
                "Expense Date must be today's date."
            )

    def validate_amount(self):
        """Amount must be greater than zero."""

        if not self.amount or self.amount <= 0:
            frappe.throw(
                "Amount must be greater than 0."
            )

    def validate_trip_vehicle(self):
        """Selected Trip must belong to selected Vehicle."""

        if not self.trip:
            return

        if not self.vehicle:
            frappe.throw(
                "Please select a Vehicle before selecting a Trip."
            )

        trip_vehicle = frappe.db.get_value(
            "Trip",
            self.trip,
            "vehicle"
        )

        if not trip_vehicle:
            frappe.throw(
                "Selected Trip does not have a Vehicle."
            )

        if trip_vehicle != self.vehicle:
            frappe.throw(
                "Selected Trip does not belong to the selected Vehicle."
            )

    def validate_duplicate_expense(self):
        """Prevent duplicate expense for same vehicle/date/type."""

        if not self.vehicle or not self.expense_date or not self.expense_type:
            return

        duplicate = frappe.db.exists(
            "Fleet Expense",
            {
                "vehicle": self.vehicle,
                "expense_date": self.expense_date,
                "expense_type": self.expense_type,
                "name": ["!=", self.name]
            }
        )

        if duplicate:
            frappe.throw(
                "An expense of this type already exists "
                "for this vehicle on this date."
            )
