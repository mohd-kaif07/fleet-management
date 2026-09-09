# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today


class VehicleDocument(Document):

    def validate(self):
        self.validate_issue_date()
        self.validate_expiry_date()
        self.validate_status()
        self.validate_duplicate_document()

    def validate_issue_date(self):
        if not self.issue_date:
            return

        if getdate(self.issue_date) > getdate(today()):
            frappe.throw(
                "Issue Date cannot be a future date."
            )

    def validate_expiry_date(self):
        if not self.expiry_date:
            return

        if getdate(self.expiry_date) < getdate(today()):
            frappe.throw(
                "Expiry Date cannot be in the past."
            )

        if self.issue_date:
            if getdate(self.expiry_date) < getdate(self.issue_date):
                frappe.throw(
                    "Expiry Date cannot be before Issue Date."
                )

    def validate_status(self):
        if self.status == "Valid":
            frappe.throw(
                "Document is Valid. Status must be Active to save."
            )

        if self.status == "Pending":
            frappe.throw(
                "Document is Pending. Please complete the document before saving."
            )

        if self.status == "Expired":
            frappe.throw(
                "Document is Expired. Please enter a valid expiry date."
            )

        if self.status != "Active":
            frappe.throw(
                "Only Active status is allowed for saving."
            )

    def validate_duplicate_document(self):
        if not self.vehicle or not self.document_type or not self.document_number:
            return

        duplicate = frappe.db.exists(
            "Vehicle Document",
            {
                "vehicle": self.vehicle,
                "document_type": self.document_type,
                "document_number": self.document_number,
                "name": ["!=", self.name],
            }
        )

        if duplicate:
            frappe.throw(
                "This document already exists for this vehicle."
            )        
