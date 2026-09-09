// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Fleet Expense", {
// 	refresh(frm) {

// 	},
// });
// frappe.ui.form.on('Fleet Expense', {

//     onload: function(frm) {

//         // New record par today's date
//         if (frm.is_new() && !frm.doc.expense_date) {
//             frm.set_value(
//                 'expense_date',
//                 frappe.datetime.get_today()
//             );
//         }

//     },

//     refresh: function(frm) {

//         // New record par today's date
//         if (frm.is_new() && !frm.doc.expense_date) {
//             frm.set_value(
//                 'expense_date',
//                 frappe.datetime.get_today()
//             );
//         }

//     },

//     amount: function(frm) {
//         validate_amount(frm);
//     },

//     expense_date: function(frm) {
//         validate_expense_date(frm);
//     },

//     validate: function(frm) {

//         // Amount validation
//         if (!validate_amount(frm)) {
//             frappe.validated = false;
//             return;
//         }

//         // Expense date validation
//         if (!validate_expense_date(frm)) {
//             frappe.validated = false;
//             return;
//         }

//         // Payment mode validation
//         if (!frm.doc.payment_mode) {

//             frappe.msgprint({
//                 title: __('Missing Payment Mode'),
//                 message: __('Please select Payment Mode.'),
//                 indicator: 'red'
//             });

//             frappe.validated = false;
//             return;
//         }

//     }

// });


// // =============================================================
// // AMOUNT VALIDATION
// // Amount must be greater than 0
// // =============================================================

// function validate_amount(frm) {

//     if (frm.doc.amount === undefined || frm.doc.amount === null) {
//         return true;
//     }

//     let amount = flt(frm.doc.amount);

//     if (amount <= 0) {

//         frappe.msgprint({
//             title: __('Invalid Amount'),
//             message: __('Amount must be greater than 0.'),
//             indicator: 'red'
//         });

//         frm.set_value('amount', 0);

//         return false;
//     }

//     return true;
// }


// // =============================================================
// // EXPENSE DATE VALIDATION
// // Future date not allowed
// // =============================================================

// function validate_expense_date(frm) {

//     if (!frm.doc.expense_date) {
//         return true;
//     }

//     let today = frappe.datetime.get_today();

//     if (frm.doc.expense_date > today) {

//         frappe.msgprint({
//             title: __('Invalid Expense Date'),
//             message: __('Expense Date cannot be in the future.'),
//             indicator: 'red'
//         });

//         frm.set_value('expense_date', today);

//         return false;
//     }

//     return true;
// }

frappe.ui.form.on("Fleet Expense", {

    refresh: function(frm) {
        // Set today's date for new document
        if (frm.is_new() && !frm.doc.expense_date) {
            frm.set_value(
                "expense_date",
                frappe.datetime.get_today()
            );
        }
    },

    expense_date: function(frm) {
        if (!frm.doc.expense_date) {
            return;
        }

        const today = frappe.datetime.get_today();

        if (frm.doc.expense_date !== today) {
            frappe.msgprint({
                title: __("Invalid Expense Date"),
                message: __("Expense Date must be today's date."),
                indicator: "red"
            });

            frm.set_value("expense_date", today);
        }
    },

    amount: function(frm) {
        if (frm.doc.amount && frm.doc.amount <= 0) {
            frappe.msgprint({
                title: __("Invalid Amount"),
                message: __("Amount must be greater than 0."),
                indicator: "red"
            });

            frm.set_value("amount", 0);
        }
    },

    trip: function(frm) {
        if (!frm.doc.trip || !frm.doc.vehicle) {
            return;
        }

        frappe.db.get_value(
            "Trip",
            frm.doc.trip,
            "vehicle"
        ).then(r => {

            if (!r.message) {
                return;
            }

            const trip_vehicle = r.message.vehicle;

            if (trip_vehicle && trip_vehicle !== frm.doc.vehicle) {

                frappe.msgprint({
                    title: __("Invalid Trip"),
                    message: __(
                        "Selected Trip does not belong to the selected Vehicle."
                    ),
                    indicator: "red"
                });

                frm.set_value("trip", "");
            }
        });
    },

    vehicle: function(frm) {
        // Clear Trip when vehicle changes
        if (frm.doc.trip) {
            frappe.db.get_value(
                "Trip",
                frm.doc.trip,
                "vehicle"
            ).then(r => {

                if (
                    r.message &&
                    r.message.vehicle &&
                    r.message.vehicle !== frm.doc.vehicle
                ) {
                    frm.set_value("trip", "");
                }
            });
        }
    },

    validate: function(frm) {

        // Expense Date validation
        if (frm.doc.expense_date) {

            const today = frappe.datetime.get_today();

            if (frm.doc.expense_date !== today) {
                frappe.throw(
                    __("Expense Date must be today's date.")
                );
            }
        }

        // Amount validation
        if (!frm.doc.amount || frm.doc.amount <= 0) {
            frappe.throw(
                __("Amount must be greater than 0.")
            );
        }

        // Vehicle validation
        if (!frm.doc.vehicle) {
            frappe.throw(
                __("Vehicle is required.")
            );
        }

        // Expense Type validation
        if (!frm.doc.expense_type) {
            frappe.throw(
                __("Expense Type is required.")
            );
        }

        // Payment Mode validation
        if (!frm.doc.payment_mode) {
            frappe.throw(
                __("Payment Mode is required.")
            );
        }
    }
});
