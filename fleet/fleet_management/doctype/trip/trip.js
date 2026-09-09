// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Trip", {
// 	refresh(frm) {

// 	},
// });
// frappe.ui.form.on("Trip", {
//     refresh(frm) {

//         // =========================================
//         // 1. TRIP ASSIGNED
//         // Scheduled → Assigned
//         // =========================================
//         if (frm.doc.trip_status === "Scheduled" && !frm.is_new()) {

//             frm.add_custom_button("Trip Assign", function () {

//                 let dialog = new frappe.ui.Dialog({
//                     title: "Assign Trip",

//                     fields: [
//                         {
//                             fieldname: "remarks",
//                             fieldtype: "Small Text",
//                             label: "Remarks",
//                             reqd: 1
//                         },
//                         {
//                             fieldname: "driver",
//                             fieldtype: "Link",
//                             options: "Driver",
//                             label: "Driver",
//                             reqd: 1
//                         }
//                     ],

//                     primary_action_label: "Assign Trip",

//                     primary_action(values) {

//                         frm.set_value("remarks", values.remarks);
//                         frm.set_value("driver", values.driver);
//                         frm.set_value("trip_status", "Assigned");

//                         frm.save().then(() => {

//                             frappe.show_alert({
//                                 message: __("Trip Assign Successfully"),
//                                 indicator: "green"
//                             });

//                             dialog.hide();
//                         });
//                     }
//                 });

//                 dialog.show();
//             });
//         }


//         // =========================================
//         // 2. TRIP STARTED
//         // Assigned → Started
//         // =========================================
//         if (frm.doc.trip_status === "Assigned" && !frm.is_new()) {

//             frm.add_custom_button("Trip Start", function () {

//                 let dialog = new frappe.ui.Dialog({
//                     title: "Start Trip",

//                     fields: [
//                         {
//                             fieldname: "start_odometer",
//                             fieldtype: "Int",
//                             label: "Started Odometer Reading",
//                             reqd: 1
//                         }
//                     ],

//                     primary_action_label: "Start Trip",

//                     primary_action(values) {

//                         // Start Odometer
//                         frm.set_value(
//                             "start_odometer",
//                             values.start_odometer
//                         );

//                         // Actual Start Date & Time
//                         frm.set_value(
//                             "trip_start_date_time",
//                             frappe.datetime.now_datetime()
//                         );

//                         // Assigned → Started
//                         frm.set_value(
//                             "trip_status",
//                             "Started"
//                         );

//                         frm.save().then(() => {

//                             frappe.show_alert({
//                                 message: __("Trip Start Successfully"),
//                                 indicator: "green"
//                             });

//                             dialog.hide();
//                         });
//                     }
//                 });

//                 dialog.show();
//             });
//         }


//         // =========================================
//         // 3. TRIP ONGOING
//         // Started → Ongoing
//         // =========================================
//         if (frm.doc.trip_status === "Started" && !frm.is_new()) {

//             frm.add_custom_button("Trip Ongoing", function () {

//                 frappe.confirm(
//                     "Are you sure you want to mark this trip as Ongoing?",

//                     function () {

//                         frm.set_value(
//                             "trip_status",
//                             "Ongoing"
//                         );

//                         frm.save().then(() => {

//                             frappe.show_alert({
//                                 message: __("Trip is now Ongoing"),
//                                 indicator: "orange"
//                             });
//                         });
//                     }
//                 );
//             });
//         }


//         // =========================================
//         // 4. TRIP COMPLETED
//         // Ongoing → Completed
//         // =========================================
//         if (frm.doc.trip_status === "Ongoing" && !frm.is_new()) {

//             frm.add_custom_button("Trip Complete", function () {

//                 let dialog = new frappe.ui.Dialog({
//                     title: "Complete Trip",

//                     fields: [
//                         {
//                             fieldname: "end_odometer",
//                             fieldtype: "Int",
//                             label: "End Odometer Reading",
//                             reqd: 1
//                         }
//                     ],

//                     primary_action_label: "Complete Trip",

//                     primary_action(values) {

//                         // End Odometer
//                         frm.set_value(
//                             "end_odometer",
//                             values.end_odometer
//                         );

//                         // Actual End Date & Time
//                         frm.set_value(
//                             "trip_ended_date_time",
//                             frappe.datetime.now_datetime()
//                         );

//                         // Ongoing → Completed
//                         frm.set_value(
//                             "trip_status",
//                             "Completed"
//                         );

//                         // Save
//                         frm.save().then(() => {

//                             frappe.show_alert({
//                                 message: __("Trip Complete Successfully"),
//                                 indicator: "green"
//                             });

//                             dialog.hide();
//                         });
//                     }
//                 });

//                 dialog.show();
//             });
//         }
//     }
// });

frappe.ui.form.on("Trip", {

    refresh(frm) {

        // =========================================
        // FIELD VISIBILITY
        // =========================================

        // Start Odometer
        // Only after Trip Start
        frm.toggle_display(
            "start_odometer",
            ["Started", "Ongoing", "Completed"].includes(frm.doc.trip_status)
        );

        // End Odometer
        // Only after Trip Complete
        frm.toggle_display(
            "end_odometer",
            frm.doc.trip_status === "Completed"
        );

        // Distance Covered
        // Only after Trip Complete
        frm.toggle_display(
            "distance_covered",
            frm.doc.trip_status === "Completed"
        );


        // =========================================
        // 1. TRIP ASSIGN
        // Scheduled → Assigned
        // =========================================

        if (
            frm.doc.trip_status === "Scheduled" &&
            !frm.is_new()
        ) {

            frm.add_custom_button("Trip Assign", function () {

                let dialog = new frappe.ui.Dialog({

                    title: "Assign Trip",

                    fields: [

                        {
                            fieldname: "remarks",
                            fieldtype: "Small Text",
                            label: "Remarks",
                            reqd: 1
                        },

                        {
                            fieldname: "driver",
                            fieldtype: "Link",
                            options: "Driver",
                            label: "Driver",
                            reqd: 1
                        }

                    ],

                    primary_action_label: "Assign Trip",

                    primary_action(values) {

                        // =========================================
                        // CHECK DRIVER
                        // =========================================

                        frappe.call({

                            method: "frappe.client.get_list",

                            args: {

                                doctype: "Trip",

                                filters: [
                                    ["driver", "=", values.driver],
                                    ["docstatus", "<", 2],
                                    ["name", "!=", frm.doc.name],
                                    ["trip_status", "in", [
                                        "Assigned",
                                        "Started",
                                        "Ongoing"
                                    ]]
                                ],

                                fields: [
                                    "name",
                                    "vehicle",
                                    "trip_status"
                                ],

                                limit_page_length: 1
                            },

                            callback(r) {

                                if (r.message && r.message.length > 0) {

                                    let active_trip = r.message[0];

                                    frappe.msgprint({

                                        title: __("Driver Already Assigned"),

                                        message: __(
                                            "Driver <b>{0}</b> is already assigned to Vehicle <b>{1}</b> in Trip <b>{2}</b>.<br><br>Please complete the current trip before assigning this driver to another trip.",
                                            [
                                                values.driver,
                                                active_trip.vehicle,
                                                active_trip.name
                                            ]
                                        ),

                                        indicator: "red"
                                    });

                                    return;
                                }


                                // =========================================
                                // DRIVER AVAILABLE
                                // =========================================

                                frm.set_value(
                                    "remarks",
                                    values.remarks
                                );

                                frm.set_value(
                                    "driver",
                                    values.driver
                                );

                                frm.set_value(
                                    "trip_status",
                                    "Assigned"
                                );


                                frm.save().then(() => {

                                    dialog.hide();

                                    frappe.show_alert({

                                        message: __(
                                            "Trip Assigned Successfully"
                                        ),

                                        indicator: "green"
                                    });

                                });

                            }

                        });

                    }

                });

                dialog.show();

            });

        }


        // =========================================
        // 2. TRIP START
        // Assigned → Started
        // =========================================

        if (
            frm.doc.trip_status === "Assigned" &&
            !frm.is_new()
        ) {

            frm.add_custom_button("Trip Start", function () {

                let dialog = new frappe.ui.Dialog({

                    title: "Start Trip",

                    fields: [

                        {
                            fieldname: "start_odometer",
                            fieldtype: "Int",
                            label: "Start Odometer",
                            reqd: 1
                        },

                        {
                            fieldname: "start_date_time",
                            fieldtype: "Datetime",
                            label: "Start Date & Time",
                            read_only: 1,
                            default: frappe.datetime.now_datetime()
                        }

                    ],

                    primary_action_label: "Start Trip",

                    primary_action(values) {

                        // =========================================
                        // START ODOMETER VALIDATION
                        // =========================================

                        if (
                            values.start_odometer === null ||
                            values.start_odometer === undefined ||
                            values.start_odometer === ""
                        ) {

                            frappe.msgprint({
                                title: __("Odometer Required"),
                                message: __(
                                    "Please enter Start Odometer."
                                ),
                                indicator: "red"
                            });

                            return;
                        }


                        // =========================================
                        // SAVE START DATA
                        // =========================================

                        frm.set_value(
                            "start_odometer",
                            values.start_odometer
                        );

                        frm.set_value(
                            "trip_started_date_time",
                            values.start_date_time
                        );

                        frm.set_value(
                            "trip_status",
                            "Started"
                        );


                        frm.save().then(() => {

                            dialog.hide();

                            // Show Start Odometer
                            frm.toggle_display(
                                "start_odometer",
                                true
                            );

                            frappe.show_alert({

                                message: __(
                                    "Trip Started Successfully"
                                ),

                                indicator: "green"
                            });

                        });

                    }

                });

                dialog.show();

            });

        }


        // =========================================
        // 3. TRIP ONGOING
        // Started → Ongoing
        // =========================================

        if (
            frm.doc.trip_status === "Started" &&
            !frm.is_new()
        ) {

            frm.add_custom_button("Trip Ongoing", function () {

                frappe.confirm(

                    __(
                        "Are you sure you want to mark this trip as Ongoing?"
                    ),

                    function () {

                        frm.set_value(
                            "trip_status",
                            "Ongoing"
                        );

                        frm.save().then(() => {

                            frappe.show_alert({

                                message: __(
                                    "Trip is now Ongoing"
                                ),

                                indicator: "orange"
                            });

                        });

                    }

                );

            });

        }


        // =========================================
        // 4. TRIP COMPLETE
        // Ongoing → Completed
        // =========================================

        if (
            frm.doc.trip_status === "Ongoing" &&
            !frm.is_new()
        ) {

            frm.add_custom_button("Trip Complete", function () {

                let dialog = new frappe.ui.Dialog({

                    title: "Complete Trip",

                    fields: [

                        {
                            fieldname: "end_odometer",
                            fieldtype: "Int",
                            label: "End Odometer",
                            reqd: 1
                        },

                        {
                            fieldname: "end_date_time",
                            fieldtype: "Datetime",
                            label: "End Date & Time",
                            read_only: 1,
                            default: frappe.datetime.now_datetime()
                        }

                    ],

                    primary_action_label: "Complete Trip",

                    primary_action(values) {

                        // =========================================
                        // END ODOMETER REQUIRED
                        // =========================================

                        if (
                            values.end_odometer === null ||
                            values.end_odometer === undefined ||
                            values.end_odometer === ""
                        ) {

                            frappe.msgprint({

                                title: __("Odometer Required"),

                                message: __(
                                    "Please enter End Odometer."
                                ),

                                indicator: "red"
                            });

                            return;
                        }


                        // =========================================
                        // END >= START VALIDATION
                        // =========================================

                        if (
                            values.end_odometer <
                            frm.doc.start_odometer
                        ) {

                            frappe.msgprint({

                                title: __("Invalid Odometer"),

                                message: __(
                                    "End Odometer ({1}) cannot be less than Start Odometer ({0}).",
                                    [
                                        frm.doc.start_odometer,
                                        values.end_odometer
                                    ]
                                ),

                                indicator: "red"
                            });

                            return;
                        }


                        // =========================================
                        // CALCULATE DISTANCE
                        // =========================================

                        let distance =
                            values.end_odometer -
                            frm.doc.start_odometer;


                        // =========================================
                        // SAVE END DATA
                        // =========================================

                        frm.set_value(
                            "end_odometer",
                            values.end_odometer
                        );

                        frm.set_value(
                            "distance_covered",
                            distance
                        );

                        frm.set_value(
                            "trip_ended_date_time",
                            values.end_date_time
                        );

                        frm.set_value(
                            "trip_status",
                            "Completed"
                        );


                        frm.save().then(() => {

                            dialog.hide();

                            // Show fields after completion
                            frm.toggle_display(
                                "start_odometer",
                                true
                            );

                            frm.toggle_display(
                                "end_odometer",
                                true
                            );

                            frm.toggle_display(
                                "distance_covered",
                                true
                            );


                            frappe.show_alert({

                                message: __(
                                    "Trip Completed Successfully. Distance Covered: {0}",
                                    [distance]
                                ),

                                indicator: "green"
                            });

                        });

                    }

                });

                dialog.show();

            });

        }

    }

});
