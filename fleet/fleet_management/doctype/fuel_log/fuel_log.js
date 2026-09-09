// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Fuel Log", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Fuel Log", {
    refresh(frm) {
        set_fuel_date_range(frm);
        toggle_calculated_fields(frm);
    },

    onload(frm) {
        set_fuel_date_range(frm);
        toggle_calculated_fields(frm);
    },

    vehicle(frm) {
        fetch_previous_odometer(frm);

        // Vehicle change hone par selected Trip validate karo
        validate_trip_vehicle(frm);
    },

    trip(frm) {
        validate_trip_vehicle(frm);
    },

    fuel_date(frm) {
        validate_fuel_date(frm);
        fetch_previous_odometer(frm);
    },

    liters_filled(frm) {
        calculate_fuel_values(frm);
    },

    fuel_rate(frm) {
        calculate_fuel_values(frm);
    },

    odometer_at_fill(frm) {
        calculate_fuel_values(frm);
    },

    validate(frm) {
        validate_fuel_date(frm);
        validate_trip_vehicle(frm);

        if (frm.doc.liters_filled <= 0) {
            frappe.throw(__("Liters Filled must be greater than 0."));
        }

        if (frm.doc.fuel_rate <= 0) {
            frappe.throw(__("Fuel Rate must be greater than 0."));
        }

        if (frm.doc.odometer_at_fill < 0) {
            frappe.throw(__("Odometer At Fill cannot be negative."));
        }

        if (
            frm.doc.previous_odometer &&
            frm.doc.odometer_at_fill < frm.doc.previous_odometer
        ) {
            frappe.throw(
                __(
                    "Odometer At Fill ({0}) cannot be less than Previous Odometer ({1}).",
                    [
                        frm.doc.odometer_at_fill,
                        frm.doc.previous_odometer
                    ]
                )
            );
        }

        calculate_fuel_values(frm);
    }
});


function set_fuel_date_range(frm) {
    const today = frappe.datetime.get_today();

    // Last 10 calendar dates including today
    const minimum_date = frappe.datetime.add_days(today, -9);

    frm.set_df_property(
        "fuel_date",
        "min_date",
        minimum_date
    );

    frm.set_df_property(
        "fuel_date",
        "max_date",
        today
    );
}


function validate_fuel_date(frm) {
    if (!frm.doc.fuel_date) {
        return;
    }

    const today = frappe.datetime.get_today();
    const minimum_date = frappe.datetime.add_days(today, -9);

    if (frm.doc.fuel_date > today) {
        frappe.throw(
            __("Fuel Date cannot be a future date.")
        );
    }

    if (frm.doc.fuel_date < minimum_date) {
        frappe.throw(
            __(
                "Fuel Date must be between {0} and {1}.",
                [
                    frappe.datetime.str_to_user(minimum_date),
                    frappe.datetime.str_to_user(today)
                ]
            )
        );
    }
}


/* ---------------------------------------------------------
   TRIP - VEHICLE VALIDATION
   --------------------------------------------------------- */

function validate_trip_vehicle(frm) {

    // Trip ya Vehicle nahi hai to validation ki zarurat nahi
    if (!frm.doc.trip || !frm.doc.vehicle) {
        return;
    }

    frappe.db.get_value(
        "Trip",
        frm.doc.trip,
        "vehicle"
    ).then(r => {

        if (!r.message) {
            frappe.msgprint({
                title: __("Invalid Trip"),
                message: __("Selected Trip was not found."),
                indicator: "red"
            });

            frm.set_value("trip", "");
            return;
        }

        const trip_vehicle = r.message.vehicle;

        // Trip ke andar Vehicle nahi mila
        if (!trip_vehicle) {
            frappe.msgprint({
                title: __("Invalid Trip"),
                message: __(
                    "Selected Trip does not have a Vehicle assigned."
                ),
                indicator: "red"
            });

            frm.set_value("trip", "");
            return;
        }

        // Trip ka vehicle aur selected vehicle match nahi karta
        if (trip_vehicle !== frm.doc.vehicle) {

            frappe.msgprint({
                title: __("Wrong Trip"),
                message: __(
                    "This Trip does not belong to the selected Vehicle."
                ),
                indicator: "red"
            });

            // Wrong Trip ko clear kar do
            frm.set_value("trip", "");
        }
    });
}


/* ---------------------------------------------------------
   PREVIOUS ODOMETER
   --------------------------------------------------------- */

function fetch_previous_odometer(frm) {

    if (!frm.doc.vehicle || !frm.doc.fuel_date) {
        return;
    }

    frappe.call({
        method: "frappe.client.get_list",

        args: {
            doctype: "Fuel Log",

            filters: [
                ["vehicle", "=", frm.doc.vehicle],
                ["fuel_date", "<=", frm.doc.fuel_date],
                ["name", "!=", frm.doc.name || ""],
                ["docstatus", "<", 2]
            ],

            fields: [
                "name",
                "odometer_at_fill",
                "fuel_date",
                "creation"
            ],

            order_by: "fuel_date desc, creation desc",

            limit_page_length: 1
        },

        callback(r) {

            if (r.message && r.message.length > 0) {

                const previous = r.message[0];

                frm.set_value(
                    "previous_odometer",
                    previous.odometer_at_fill || 0
                );

            } else {

                frm.set_value(
                    "previous_odometer",
                    0
                );
            }

            calculate_fuel_values(frm);
        }
    });
}


/* ---------------------------------------------------------
   CALCULATED FIELDS
   --------------------------------------------------------- */

function toggle_calculated_fields(frm) {

    const calculated_fields = [
        "distance_travelled",
        "fuel_efficiency",
        "total_cost",
        "cost_per_km"
    ];

    calculated_fields.forEach(fieldname => {

        frm.toggle_display(
            fieldname,
            !frm.is_new()
        );

    });
}


/* ---------------------------------------------------------
   FUEL CALCULATIONS
   --------------------------------------------------------- */

function calculate_fuel_values(frm) {

    const liters = flt(frm.doc.liters_filled);
    const rate = flt(frm.doc.fuel_rate);
    const previous = flt(frm.doc.previous_odometer);
    const current = flt(frm.doc.odometer_at_fill);


    // Total Cost
    frm.set_value(
        "total_cost",
        liters * rate
    );


    // Distance
    if (current >= previous && previous > 0) {

        const distance = current - previous;

        frm.set_value(
            "distance_travelled",
            distance
        );


        // Fuel Efficiency
        if (liters > 0) {

            frm.set_value(
                "fuel_efficiency",
                distance / liters
            );

        } else {

            frm.set_value(
                "fuel_efficiency",
                0
            );
        }


        // Cost Per KM
        if (distance > 0) {

            frm.set_value(
                "cost_per_km",
                (liters * rate) / distance
            );

        } else {

            frm.set_value(
                "cost_per_km",
                0
            );
        }

    } else {

        frm.set_value(
            "distance_travelled",
            0
        );

        frm.set_value(
            "fuel_efficiency",
            0
        );

        frm.set_value(
            "cost_per_km",
            0
        );
    }
}
