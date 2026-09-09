# Copyright (c) 2026, kaif and contributors
# For license information, please see license.txt

# import frappe
# import frappe
# from frappe.model.document import Document


# class VehicleName(Document):

#     def validate(self):
#         self.validate_vehicle_name()
#         self.validate_capacity()
#         self.validate_fuel_type()

#     def validate_vehicle_name(self):
#         if not self.vehicle_name:
#             frappe.throw("Vehicle Name is required.")

#         self.vehicle_name = self.vehicle_name.strip()

#         if len(self.vehicle_name) < 3:
#             frappe.throw(
#                 "Vehicle Name must be at least 3 characters long."
#             )

#     def validate_capacity(self):
#         if self.capacity is not None:

#             # Negative value check
#             if float(self.capacity) < 0:
#                 frappe.throw(
#                     "Negative capacity (-) allowed nahi hai. "
#                     "Please use a positive (+) value."
#                 )

#             # Zero check
#             if float(self.capacity) == 0:
#                 frappe.throw(
#                     "Capacity 0 nahi ho sakti. "
#                     "Please enter a positive (+) value."
#                 )

#     def validate_fuel_type(self):
#         if not self.fuel_type:
#             frappe.throw(
#                 "Please select Fuel Type."
#             )
