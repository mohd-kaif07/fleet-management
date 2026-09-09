// Copyright (c) 2026, kaif and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Maintenance", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Maintenance', {

    onload: function(frm) {
        set_date_restrictions(frm);
        set_total_cost_visibility(frm);
        set_status_options(frm);
    },

    refresh: function(frm) {
        set_date_restrictions(frm);
        set_total_cost_visibility(frm);
        set_status_options(frm);
        calculate_total_cost(frm);
    },

    service_date: function(frm) {
        validate_service_date(frm);
    },

    next_service_date: function(frm) {
        validate_next_service_date(frm);
    },

    labor_cost: function(frm) {
        calculate_total_cost(frm);
    },

    parts_cost: function(frm) {
        calculate_total_cost(frm);
    },

    other_cost: function(frm) {
        calculate_total_cost(frm);
    },

    status: function(frm) {
        validate_status_change(frm);
    }

});


// =============================================================
// TOTAL COST HIDE / SHOW
// =============================================================

function set_total_cost_visibility(frm) {

    frm.set_df_property(
        'total_cost',
        'hidden',
        frm.is_new()
    );

}


// =============================================================
// TOTAL COST CALCULATION
// =============================================================

function calculate_total_cost(frm) {

    let labor_cost = flt(frm.doc.labor_cost);
    let parts_cost = flt(frm.doc.parts_cost);
    let other_cost = flt(frm.doc.other_cost);

    let total_cost =
        labor_cost +
        parts_cost +
        other_cost;

    frm.set_value(
        'total_cost',
        total_cost
    );

}


// =============================================================
// SERVICE DATE
// ONLY TODAY ALLOWED
// =============================================================

function validate_service_date(frm) {

    if (!frm.doc.service_date) {
        return;
    }

    let today = frappe.datetime.get_today();

    if (frm.doc.service_date !== today) {

        frappe.msgprint({
            title: __('Invalid Service Date'),
            message: __('Service Date must be today\'s date.'),
            indicator: 'red'
        });

        frm.set_value('service_date', '');

    }

}


// =============================================================
// NEXT SERVICE DATE
//
// MINIMUM = TODAY + 15 DAYS
// MAXIMUM = 08-10-2026
// =============================================================

function validate_next_service_date(frm) {

    if (!frm.doc.next_service_date) {
        return;
    }

    let today = frappe.datetime.get_today();

    let minimum_date =
        frappe.datetime.add_days(today, 15);

    let maximum_date = '2026-10-08';


    // Minimum check

    if (frm.doc.next_service_date < minimum_date) {

        frappe.msgprint({
            title: __('Invalid Next Service Date'),
            message: __(
                'Next Service Date must be at least 15 days after today.'
            ),
            indicator: 'red'
        });

        frm.set_value('next_service_date', '');

        return;
    }


    // Maximum check

    if (frm.doc.next_service_date > maximum_date) {

        frappe.msgprint({
            title: __('Invalid Next Service Date'),
            message: __(
                'Next Service Date cannot be later than 08-10-2026.'
            ),
            indicator: 'red'
        });

        frm.set_value('next_service_date', '');

    }

}


// =============================================================
// DATE PICKER RESTRICTIONS
// =============================================================

function set_date_restrictions(frm) {

    let today = frappe.datetime.get_today();


    // ---------------------------------------------------------
    // SERVICE DATE
    // ONLY TODAY
    // ---------------------------------------------------------

    frm.set_df_property(
        'service_date',
        'min',
        today
    );

    frm.set_df_property(
        'service_date',
        'max',
        today
    );


    // ---------------------------------------------------------
    // NEXT SERVICE DATE
    // MINIMUM = TODAY + 15 DAYS
    // MAXIMUM = 08-10-2026
    // ---------------------------------------------------------

    let minimum_next_service_date =
        frappe.datetime.add_days(today, 15);

    frm.set_df_property(
        'next_service_date',
        'min',
        minimum_next_service_date
    );

    frm.set_df_property(
        'next_service_date',
        'max',
        '2026-10-08'
    );

}


// =============================================================
// STATUS DROPDOWN OPTIONS
//
// NEW RECORD:
// Pending
//
// PENDING:
// Pending / In progress
//
// IN PROGRESS:
// In progress / Completed
//
// COMPLETED:
// Completed
// =============================================================

function set_status_options(frm) {

    // New record
    if (frm.is_new()) {

        frm.set_df_property(
            'status',
            'options',
            'Pending'
        );

        frm.set_value(
            'status',
            'Pending'
        );

        return;
    }


    let current_status = frm.doc.status;


    // ---------------------------------------------------------
    // PENDING
    // ---------------------------------------------------------

    if (current_status === 'Pending') {

        frm.set_df_property(
            'status',
            'options',
            'Pending\nIn progress'
        );

    }


    // ---------------------------------------------------------
    // IN PROGRESS
    // ---------------------------------------------------------

    else if (current_status === 'In progress') {

        frm.set_df_property(
            'status',
            'options',
            'In progress\nCompleted'
        );

    }


    // ---------------------------------------------------------
    // COMPLETED
    // ---------------------------------------------------------

    else if (current_status === 'Completed') {

        frm.set_df_property(
            'status',
            'options',
            'Completed'
        );

    }

}


// =============================================================
// STATUS CHANGE VALIDATION
// =============================================================

function validate_status_change(frm) {

    if (frm.is_new()) {

        if (frm.doc.status !== 'Pending') {

            frappe.msgprint({
                title: __('Invalid Status'),
                message: __(
                    'New Maintenance record must have Status as Pending.'
                ),
                indicator: 'red'
            });

            frm.set_value(
                'status',
                'Pending'
            );
        }

        // New record ke liye status limit check
        check_status_limit(frm);

        return;
    }


    let old_status = frm.get_doc_before_save();

    if (!old_status) {
        return;
    }

    old_status = old_status.status;

    let new_status = frm.doc.status;


    // Pending → In progress
    if (
        old_status === 'Pending' &&
        new_status === 'In progress'
    ) {
        check_status_limit(frm);
        return;
    }


    // In progress → Completed
    if (
        old_status === 'In progress' &&
        new_status === 'Completed'
    ) {
        check_status_limit(frm);
        return;
    }


    // Same status is allowed
    if (old_status === new_status) {
        return;
    }


    // Any other transition is invalid

    frappe.msgprint({
        title: __('Invalid Status Change'),
        message: __(
            'Status can only move from Pending → In progress → Completed.'
        ),
        indicator: 'red'
    });


    frm.set_value(
        'status',
        old_status
    );

}


// =============================================================
// STATUS LIMIT
//
// Pending     = Maximum 2
// In progress = Maximum 1
// Completed   = Unliminted
// =============================================================

function check_status_limit(frm) {

    let current_status = frm.doc.status;

    let status_limits = {
        'Pending': 5,
        'In progress': 5
    };

    let max_allowed = status_limits[current_status];

    // Completed = Unlimited
    if (!max_allowed) {
        return;
    }


    // Current document ko exclude karne ke liye
    let filters = {
        'status': current_status
    };


    // Existing document hai to usko count mein include mat karo
    if (!frm.is_new()) {
        filters.name = ['!=', frm.doc.name];
    }


    frappe.db.count('Maintenance', {
        filters: filters
    }).then(function(count) {

        if (count >= max_allowed) {

            frappe.msgprint({
                title: __('Status Limit Reached'),
                message: __(
                    'Maximum ' +
                    max_allowed +
                    ' Maintenance record(s) are allowed in "' +
                    current_status +
                    '" status.'
                ),
                indicator: 'red'
            });


            // Existing record hai to previous status par wapas
            if (!frm.is_new()) {

                let old_doc = frm.get_doc_before_save();

                if (old_doc) {
                    frm.set_value(
                        'status',
                        old_doc.status
                    );
                }

            }
            else {

                // New record ke liye Pending clear
                frm.set_value(
                    'status',
                    ''
                );

            }

        }

    });

}
