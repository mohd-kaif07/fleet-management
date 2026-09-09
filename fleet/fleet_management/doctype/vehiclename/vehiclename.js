// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VehicleName", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("VehicleName", {

    capacity(frm) {
        check_vehicle_capacity(frm);
    },

    vehicle_name(frm) {
        check_vehicle_capacity(frm);
    }

});


function check_vehicle_capacity(frm) {

    const limits = {
        "bike": 2,
        "car": 8,
        "bus": 40,
        "truck": 10
    };

    const vehicle = (frm.doc.vehicle_name || "").toLowerCase().trim();
    const capacity = parseFloat(frm.doc.capacity);

    if (!vehicle || isNaN(capacity)) {
        return;
    }

    // Automatically vehicle type find karo
    let vehicle_type = null;

    for (const type in limits) {

        if (vehicle.includes(type)) {
            vehicle_type = type;
            break;
        }

    }

    if (!vehicle_type) {
        return;
    }

    const required_capacity = limits[vehicle_type];

    // Capacity exact nahi hai
    if (capacity !== required_capacity) {

        frappe.show_alert({
            message:
                `<b>${vehicle_type.toUpperCase()}</b> ki capacity ` +
                `<b>${required_capacity}</b> honi chahiye. ` +
                `Aapne <b>${capacity}</b> enter ki hai.`,
            indicator: "red"
        }, 5);

    }
}
