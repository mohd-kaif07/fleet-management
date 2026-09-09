// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Vehicle Assignment", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Vehicle Assignment", {

    onload: function(frm) {

        // Assignment Status user manually change nahi kar sakta
        frm.set_df_property(
            "assignment_status",
            "read_only",
            1
        );
    },


    refresh: function(frm) {

        // Assignment Status always read-only
        frm.set_df_property(
            "assignment_status",
            "read_only",
            1
        );

        // Status automatically set karo
        frm.trigger("set_assignment_status");
    },


    // ----------------------------------------
    // NEW RECORD
    // ----------------------------------------

    setup: function(frm) {

        // New assignment mein Assignment Date automatically today
        if (frm.is_new() && !frm.doc.assignment_date) {

            frm.set_value(
                "assignment_date",
                frappe.datetime.get_today()
            );
        }

        // New assignment ka status Assigned
        if (frm.is_new() && !frm.doc.end_date) {

            frm.set_value(
                "assignment_status",
                "Assigned"
            );
        }
    },


    // ----------------------------------------
    // ASSIGNMENT DATE CHANGE
    // ----------------------------------------

    assignment_date: function(frm) {

        if (!frm.doc.assignment_date) {
            return;
        }

        let today = frappe.datetime.get_today();

        // Assignment Date future nahi ho sakti
        if (frm.doc.assignment_date > today) {

            frappe.msgprint({
                title: __("Invalid Assignment Date"),
                message: __(
                    "Assignment Date cannot be a future date."
                ),
                indicator: "red"
            });

            frm.set_value(
                "assignment_date",
                today
            );

            return;
        }

        // Agar End Date already hai
        // to End Date Assignment Date se pehle nahi honi chahiye
        if (frm.doc.end_date) {

            if (frm.doc.end_date < frm.doc.assignment_date) {

                frappe.msgprint({
                    title: __("Invalid End Date"),
                    message: __(
                        "End Date cannot be before Assignment Date."
                    ),
                    indicator: "red"
                });

                frm.set_value(
                    "end_date",
                    ""
                );

                frm.set_value(
                    "assignment_status",
                    "Assigned"
                );
            }
        }
    },


    // ----------------------------------------
    // END DATE CHANGE
    // ----------------------------------------

    end_date: function(frm) {

        // End Date blank = Assigned
        if (!frm.doc.end_date) {

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            return;
        }

        let today = frappe.datetime.get_today();

        // ----------------------------------------
        // END DATE FUTURE CHECK
        // ----------------------------------------

        if (frm.doc.end_date > today) {

            frappe.msgprint({
                title: __("Invalid End Date"),
                message: __(
                    "End Date cannot be a future date."
                ),
                indicator: "red"
            });

            frm.set_value(
                "end_date",
                ""
            );

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            return;
        }


        // ----------------------------------------
        // END DATE BEFORE ASSIGNMENT DATE
        // ----------------------------------------

        if (
            frm.doc.assignment_date &&
            frm.doc.end_date < frm.doc.assignment_date
        ) {

            frappe.msgprint({
                title: __("Invalid End Date"),
                message: __(
                    "End Date cannot be before Assignment Date."
                ),
                indicator: "red"
            });

            frm.set_value(
                "end_date",
                ""
            );

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            return;
        }


        // ----------------------------------------
        // VALID END DATE
        // ----------------------------------------

        frm.set_value(
            "assignment_status",
            "Released"
        );
    },


    // ----------------------------------------
    // AUTOMATIC STATUS
    // ----------------------------------------

    set_assignment_status: function(frm) {

        // End Date blank
        if (!frm.doc.end_date) {

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            // Assignment Date blank hai
            // to today set karo
            if (!frm.doc.assignment_date) {

                frm.set_value(
                    "assignment_date",
                    frappe.datetime.get_today()
                );
            }

            return;
        }


        let today = frappe.datetime.get_today();


        // End Date future hai
        if (frm.doc.end_date > today) {

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            return;
        }


        // End Date Assignment Date se pehle
        if (
            frm.doc.assignment_date &&
            frm.doc.end_date < frm.doc.assignment_date
        ) {

            frm.set_value(
                "assignment_status",
                "Assigned"
            );

            return;
        }


        // Valid End Date
        frm.set_value(
            "assignment_status",
            "Released"
        );
    }

});
