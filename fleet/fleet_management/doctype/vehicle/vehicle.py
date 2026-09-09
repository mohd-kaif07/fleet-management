# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today
from datetime import datetime


class Vehicle(Document):

    def validate(self):
        self.validate_vehicle_number()
        self.validate_make()
        self.validate_fuel_type()
        self.validate_manufacturing_year()
        self.validate_purchase_date()
        self.validate_purchase_cost()
        self.validate_current_odometer()
        self.validate_insurance_expiry()
        self.validate_registration_expiry()
        self.validate_is_active()


    # ========================================
    # VEHICLE NUMBER
    # ========================================

    def validate_vehicle_number(self):

        if not self.vehicle_number:
            frappe.throw(
                "Vehicle Number is required."
            )

        self.vehicle_number = self.vehicle_number.strip().upper()

        if len(self.vehicle_number) < 10:
            frappe.throw(
                "Vehicle Number must be at least 10 characters long."
            )


    # ========================================
    # MAKE
    # ========================================

    def validate_make(self):

        if not self.make:
            frappe.throw(
                "Make is required."
            )

        self.make = self.make.strip().title()


    # ========================================
    # FUEL TYPE
    # ========================================

    def validate_fuel_type(self):

        if not self.fuel_type:
            frappe.throw(
                "Fuel Type is required."
            )


    # ========================================
    # MANUFACTURING YEAR
    # ========================================

    def validate_manufacturing_year(self):

        if self.manufacturing_year:

            current_year = datetime.now().year

            if (
                self.manufacturing_year < 2000
                or self.manufacturing_year > current_year
            ):

                frappe.throw(
                    f"Manufacturing Year must be between "
                    f"2000 and {current_year}."
                )


    # ========================================
    # PURCHASE DATE
    # ========================================

    def validate_purchase_date(self):

        if not self.purchase_date:
            return

        # Purchase Date future mein nahi ho sakti
        if getdate(self.purchase_date) > getdate(today()):

            frappe.throw(
                "Purchase Date cannot be a future date. "
                "Please select today or an earlier date."
            )


    # ========================================
    # PURCHASE COST
    # ========================================

    def validate_purchase_cost(self):

        if (
            self.purchase_cost is not None
            and self.purchase_cost < 0
        ):

            frappe.throw(
                "Purchase Cost cannot be negative."
            )


    # ========================================
    # CURRENT ODOMETER
    # ========================================

    def validate_current_odometer(self):

        if (
            self.current_odometer is not None
            and self.current_odometer < 0
        ):

            frappe.throw(
                "Current Odometer cannot be negative."
            )


    # ========================================
    # INSURANCE EXPIRY
    # ========================================

    def validate_insurance_expiry(self):

        if (
            self.insurance_expiry
            and getdate(self.insurance_expiry) < getdate(today())
        ):

            frappe.throw(
                "Insurance Expiry Date cannot be in the past."
            )


    # ========================================
    # REGISTRATION EXPIRY
    # ========================================

    def validate_registration_expiry(self):

        if (
            self.registration_expiry
            and getdate(self.registration_expiry) < getdate(today())
        ):

            frappe.throw(
                "Registration Expiry Date cannot be in the past."
            )


    # ========================================
    # IS ACTIVE
    # ========================================

    def validate_is_active(self):

        if not self.is_active:

            frappe.throw(
                "Is Active must be either 'Yes' or 'No'."
            )


    # ========================================
    # BEFORE SAVE
    # ========================================

    def before_save(self):

        if self.vehicle_number:
            self.vehicle_number = self.vehicle_number.upper()

        if self.make:
            self.make = self.make.title()

        if self.fuel_type:
            self.fuel_type = self.fuel_type.title()


    # ========================================
    # OTHER EVENTS
    # ========================================

    def on_update(self):
        pass

    def on_trash(self):
        pass

    def on_cancel(self):
        pass

    def on_submit(self):
        pass

    def on_update_after_submit(self):
        pass

    def on_cancel_after_submit(self):
        pass
