(function($) { 
"use strict";
    $(document).ready(function ($) {
        // Testimonials Slider
        var mobile_mode_items = "",
            tablet_mode_items = "",
            items = "";
        
        $( '.testimonials' ).each( function() {
            var mobile_mode_items = $(this).attr('data-mobile-items'),
                tablet_mode_items = $(this).attr('data-tablet-items'),
                items = $(this).attr('data-items'),
                id = $(this).attr('id');

            $("#" + id + ".testimonials.owl-carousel").owlCarousel({
                nav: true, // Show next/prev buttons.
                items: 2, // The number of items you want to see on the screen.
                loop: false, // Infinity loop. Duplicate last and first items to get loop illusion.
                navText: false,
                margin: 10,
                responsive : {
                    // breakpoint from 0 up
                    0 : {
                        items: mobile_mode_items,
                    },
                    // breakpoint from 768 up
                    768 : {
                        items: tablet_mode_items,
                    },
                    1200 : {
                        items: items,
                    }
                }
            });
        });
    });
})(jQuery);