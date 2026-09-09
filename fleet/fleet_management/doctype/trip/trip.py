# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document


class Trip(Document):

    def validate(self):
        self.validate_odometer()
        self.validate_date_time()
        self.validate_driver_vehicle_assignment()
        self.calculate_distance()

    # =========================================
    # ODOMETER VALIDATION
    # =========================================

    def validate_odometer(self):

        # Start odometer is required before calculating distance
        if not self.start_odometer:
            return

        # End odometer is not entered yet.
        # This is allowed because trip may still be ongoing.
        if not self.end_odometer:
            return

        # End odometer cannot be less than start odometer
        if self.end_odometer < self.start_odometer:

            frappe.throw(
                f"End Odometer <b>{self.end_odometer}</b> "
                f"cannot be less than Start Odometer "
                f"<b>{self.start_odometer}</b>."
            )

    # =========================================
    # DATE TIME VALIDATION
    # =========================================

    def validate_date_time(self):

        # If either date/time is not entered, skip validation
        if not self.start_date_time or not self.end_date_time:
            return

        # End date/time cannot be before start date/time
        if self.end_date_time < self.start_date_time:

            frappe.throw(
                "End Date Time cannot be before Start Date Time."
            )

    # =========================================
    # DRIVER & VEHICLE ASSIGNMENT
    # =========================================

    def validate_driver_vehicle_assignment(self):

        # Driver or vehicle not selected
        if not self.driver or not self.vehicle:
            return

        # Completed / Cancelled trips should not block
        # driver or vehicle from being assigned elsewhere
        if self.trip_status in ["Completed", "Cancelled"]:
            return

        # =========================================
        # CHECK DRIVER
        # =========================================

        existing_driver_trip = frappe.db.sql(
            """
            SELECT name, vehicle, trip_status
            FROM `tabTrip`
            WHERE driver = %s
              AND docstatus < 2
              AND name != %s
              AND trip_status IN (
                  'Assigned',
                  'Started',
                  'Ongoing'
              )
            LIMIT 1
            """,
            (self.driver, self.name),
            as_dict=True
        )

        if existing_driver_trip:

            trip = existing_driver_trip[0]

            frappe.throw(
                f"Driver <b>{self.driver}</b> is already assigned "
                f"to Vehicle <b>{trip.vehicle}</b> in active Trip "
                f"<b>{trip.name}</b> "
                f"with status <b>{trip.trip_status}</b>."
                f"<br><br>"
                f"Please complete the current trip before assigning "
                f"another trip to this driver."
            )

        # =========================================
        # CHECK VEHICLE
        # =========================================

        existing_vehicle_trip = frappe.db.sql(
            """
            SELECT name, driver, trip_status
            FROM `tabTrip`
            WHERE vehicle = %s
              AND docstatus < 2
              AND name != %s
              AND trip_status IN (
                  'Assigned',
                  'Started',
                  'Ongoing'
              )
            LIMIT 1
            """,
            (self.vehicle, self.name),
            as_dict=True
        )

        if existing_vehicle_trip:

            trip = existing_vehicle_trip[0]

            frappe.throw(
                f"Vehicle <b>{self.vehicle}</b> is already assigned "
                f"to Driver <b>{trip.driver}</b> in active Trip "
                f"<b>{trip.name}</b>."
            )

    # =========================================
    # CALCULATE DISTANCE
    # =========================================

    def calculate_distance(self):

        # No start odometer
        if not self.start_odometer:
            return

        # End odometer not entered yet.
        # Do not calculate distance.
        if not self.end_odometer:
            self.distance_covered = 0
            return

        # Calculate distance only when both values exist
        self.distance_covered = (
            self.end_odometer - self.start_odometer
        )
