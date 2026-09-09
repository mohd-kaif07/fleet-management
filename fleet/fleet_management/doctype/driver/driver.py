# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today


class Driver(Document):

    def validate(self):
        self.validate_status()
        self.validate_license_dates()

    # =========================================
    # DRIVER STATUS VALIDATION
    # =========================================

    def validate_status(self):

        # Only Active drivers can be saved
        if self.status != "Active":

            frappe.throw(
                "Driver must be Active. "
                "Please select Active status before saving the Driver."
            )

    # =========================================
    # LICENSE DATE VALIDATION
    # =========================================

    def validate_license_dates(self):

        if not self.license_issue_date:
            return

        issue_date = getdate(self.license_issue_date)
        current_date = getdate(today())

        # =========================================
        # ISSUE DATE CANNOT BE IN THE FUTURE
        # =========================================

        if issue_date > current_date:

            frappe.throw(
                f"License Issue Date <b>{issue_date}</b> "
                f"cannot be a future date.<br><br>"
                f"License Issue Date cannot be in the future"
                f"Please enter a valid date that is today or earlier."
                f"<b>{current_date}</b>."
            )

        # =========================================
        # EXPIRY DATE VALIDATION
        # =========================================

        if self.license_expiry_date:

            expiry_date = getdate(self.license_expiry_date)

            # Expiry date cannot be before issue date
            if expiry_date < issue_date:

                frappe.throw(
                    "License Expiry Date cannot be before "
                    "License Issue Date.<br><br>"
                    "Please enter a valid License Expiry Date."
                )

            # =========================================
            # LICENSE ALREADY EXPIRED
            # =========================================

            if expiry_date < current_date:

                frappe.throw(
                    f"License Expiry Date <b>{expiry_date}</b> "
                    f"has already expired.<br><br>"
                    f"Please enter a valid License Expiry Date "
                    f"that is today or a future date."
                )
