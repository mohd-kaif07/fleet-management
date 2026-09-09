# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today


class VehicleAssignment(Document):

    # ========================================
    # BEFORE VALIDATE
    # ========================================

    def before_validate(self):

        self.set_assignment_details()


    # ========================================
    # VALIDATE
    # ========================================

    def validate(self):

        self.validate_assignment_date()
        self.validate_end_date()
        self.validate_duplicate_assignment()


    # ========================================
    # AUTOMATIC STATUS & ASSIGNMENT DATE
    # ========================================

    def set_assignment_details(self):

        # ----------------------------------------
        # END DATE BLANK
        # = ASSIGNED
        # ----------------------------------------

        if not self.end_date:

            self.assignment_status = "Assigned"

            # New assignment ke liye today's date
            if not self.assignment_date:

                self.assignment_date = today()


        # ----------------------------------------
        # END DATE FILLED
        # = RELEASED
        # ----------------------------------------

        else:

            self.assignment_status = "Released"


    # ========================================
    # ASSIGNMENT DATE VALIDATION
    # ========================================

    def validate_assignment_date(self):

        if not self.assignment_date:
            return

        # Assignment Date future nahi ho sakti
        if getdate(self.assignment_date) > getdate(today()):

            frappe.throw(
                "Assignment Date cannot be a future date."
            )


    # ========================================
    # END DATE VALIDATION
    # ========================================

    def validate_end_date(self):

        if not self.end_date:
            return


        # ----------------------------------------
        # END DATE FUTURE CHECK
        # ----------------------------------------

        if getdate(self.end_date) > getdate(today()):

            frappe.throw(
                "End Date cannot be a future date."
            )


        # ----------------------------------------
        # END DATE BEFORE ASSIGNMENT DATE
        # ----------------------------------------

        if self.assignment_date:

            if (
                getdate(self.end_date)
                < getdate(self.assignment_date)
            ):

                frappe.throw(
                    "End Date cannot be before Assignment Date."
                )


    # ========================================
    # DUPLICATE ASSIGNMENT VALIDATION
    # ========================================

    def validate_duplicate_assignment(self):

        # Vehicle/Driver missing ho
        if not self.vehicle or not self.driver:
            return


        # ----------------------------------------
        # RELEASED RECORD
        # ----------------------------------------
        #
        # Released assignment duplicate check
        # nahi karega.
        #
        # Same vehicle future mein dobara assign
        # ho sakta hai.
        # ----------------------------------------

        if self.assignment_status != "Assigned":
            return


        # ========================================
        # SAME VEHICLE CHECK
        # ========================================

        existing_vehicle = frappe.db.exists(
            "Vehicle Assignment",
            {
                "vehicle": self.vehicle,
                "assignment_status": "Assigned",
                "name": ["!=", self.name],
            }
        )

        if existing_vehicle:

            frappe.throw(
                f"Vehicle {self.vehicle} is already assigned "
                "to another driver."
            )


        # ========================================
        # SAME DRIVER CHECK
        # ========================================

        existing_driver = frappe.db.exists(
            "Vehicle Assignment",
            {
                "driver": self.driver,
                "assignment_status": "Assigned",
                "name": ["!=", self.name],
            }
        )

        if existing_driver:

            frappe.throw(
                f"Driver {self.driver} is already assigned "
                "to another vehicle."
            )
