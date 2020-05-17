(function($) { 
"use strict";
    $('.pf-load-more').click(function(e){
        e.preventDefault();
 
        var button = $(this),
            data = {
            'action': 'loadmore',
            'query': aveo_loadmore_params.posts, // that's how we get params from wp_localize_script() function
            'page' : aveo_loadmore_params.current_page
        };
 
        $.ajax({
            url : aveo_loadmore_params.ajaxurl, // AJAX handler
            data : data,
            type : 'POST',
            context: document.body,
            beforeSend : function ( xhr ) {
                button.text('Loading...'); // change the button text, you can also add a preloader image
            },
            success : function( data, html ){
                if( data ) { 
                    button.text( 'More posts' ); // insert new posts
                    aveo_loadmore_params.current_page++;
 
                    if ( aveo_loadmore_params.current_page == aveo_loadmore_params.max_page ) {
                        button.remove(); // if last page, remove the button
                    }
                    // you can also fire the "post-load" event here if you use a plugin that requires it
                    // $( document.body ).trigger( 'post-load' );

                    var newdata = $(data);
                    
                    $(".portfolio-grid").append(data);

                    var $figure = $(".portfolio-grid").find('figure:not(.shuffle-item)');

                    $figure.imagesLoaded().always( function() {
                        $(".portfolio-grid").shuffle('appended', $figure);
                        console.log(data);
                    });



                } else {
                    button.remove(); // if no data, remove the button as well
                }
            }
        });
    });
})(jQuery);