# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today, add_days


class Maintenance(Document):

    def validate(self):
        self.validate_required_fields()
        self.validate_service_date()
        self.validate_odometer()
        self.validate_costs()
        self.validate_next_service_date()
        self.validate_next_service_odometer()
        self.validate_status()
        self.calculate_total_cost()


    # =========================================================
    # REQUIRED FIELDS
    # =========================================================

    def validate_required_fields(self):

        if not self.vehicle:
            frappe.throw("Vehicle is required.")

        if not self.maintenance_type:
            frappe.throw("Maintenance Type is required.")

        if not self.service_date:
            frappe.throw("Service Date is required.")

        if self.odometer_reading is None:
            frappe.throw("Odometer Reading is required.")


    # =========================================================
    # SERVICE DATE
    # ONLY TODAY
    # =========================================================

    def validate_service_date(self):

        if not self.service_date:
            return

        current_date = getdate(today())
        service_date = getdate(self.service_date)

        if service_date != current_date:

            frappe.throw(
                "Service Date must be today's date."
            )


    # =========================================================
    # ODOMETER
    # =========================================================

    def validate_odometer(self):

        if self.odometer_reading is not None:

            if self.odometer_reading < 0:

                frappe.throw(
                    "Odometer Reading cannot be negative."
                )


    # =========================================================
    # COST VALIDATION
    # =========================================================

    def validate_costs(self):

        costs = {
            "Labor Cost": self.labor_cost,
            "Parts Cost": self.parts_cost,
            "Other Cost": self.other_cost
        }

        for label, value in costs.items():

            if value is not None and value < 0:

                frappe.throw(
                    f"{label} cannot be negative."
                )


    # =========================================================
    # NEXT SERVICE DATE
    #
    # MINIMUM = TODAY + 15 DAYS
    # MAXIMUM = 08-10-2026
    # =========================================================

    def validate_next_service_date(self):

        if not self.next_service_date:
            return

        current_date = getdate(today())
        next_service_date = getdate(self.next_service_date)

        minimum_date = add_days(
            current_date,
            15
        )

        maximum_date = getdate(
            "2026-10-08"
        )


        # Minimum date check

        if next_service_date < minimum_date:

            frappe.throw(
                f"Next Service Date must be on or after "
                f"{minimum_date.strftime('%d-%m-%Y')}."
            )


        # Maximum date check

        if next_service_date > maximum_date:

            frappe.throw(
                "Next Service Date cannot be later than 08-10-2026."
            )


    # =========================================================
    # NEXT SERVICE ODOMETER
    # =========================================================

    def validate_next_service_odometer(self):

        if (
            self.next_service_odometer is not None
            and self.odometer_reading is not None
        ):

            if (
                self.next_service_odometer
                <= self.odometer_reading
            ):

                frappe.throw(
                    "Next Service Odometer must be greater "
                    "than the current Odometer Reading."
                )


    # =========================================================
    # STATUS VALIDATION
    #
    # Pending → In progress → Completed
    # =========================================================

    def validate_status(self):

        # New record
        if self.is_new():

            if not self.status:

                self.status = "Pending"

            elif self.status != "Pending":

                frappe.throw(
                    "New Maintenance record must have "
                    "Status as Pending."
                )

            return


        # Get previous saved status
        previous_status = self.get_db_value("status")

        if not previous_status:
            return


        current_status = self.status


        # Same status is allowed

        if previous_status == current_status:
            return


        # Pending → In progress

        if (
            previous_status == "Pending"
            and current_status == "In progress"
        ):
            return


        # In progress → Completed

        if (
            previous_status == "In progress"
            and current_status == "Completed"
        ):
            return


        # Everything else is invalid

        frappe.throw(
            f"Invalid status change: "
            f"{previous_status} → {current_status}. "
            f"Status must follow: "
            f"Pending → In progress → Completed."
        )


    # =========================================================
    # TOTAL COST
    # =========================================================

    def calculate_total_cost(self):

        labor_cost = self.labor_cost or 0
        parts_cost = self.parts_cost or 0
        other_cost = self.other_cost or 0

        self.total_cost = (
            labor_cost
            + parts_cost
            + other_cost
        )
