/**
 * Template Selector Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['template-sequence'] = wp.customize.Control.extend(
	{
		ready: function() {
			var control  = this
			var radios   = $( control.selector + ' input[type="radio"]' )
			var val      = control.setting._value
			var template = val.template

			// Listen to Template selection change.
			radios.on(
				'change',
				function () {
					template        = $( this ).val()
					var cols        = template.split( '-' )
					var colsLength  = cols.length
					var matcherHtml = ''
					var sequence    = [ 'main' ]
					var sidebars    = $( '#_customize-input-sidebars_qty' ).val()

					for ( var i = 1; i <= colsLength; i ++ ) {
						matcherHtml += '<div class="gl-template-matcher col-' + cols[ i - 1 ] + '">'
						matcherHtml += '<select class="gl-template-selection">'
						var selected = ( i === 1 ) ? 'selected' : ''
						matcherHtml += '<option value="main" ' + selected + '>Main Content</option>'
						for ( var j = 1; j <= sidebars; j ++ ) {
							selected     = ( i === ( j + 1 ) ) ? 'selected' : ''
							matcherHtml += '<option value="sidebar-' + j + '" ' + selected + '>Sidebar ' + j + '</option>'
						}
						matcherHtml += '</select>'
						matcherHtml += '<div class="gl-template-matcher-column">col ' + i + ' (' + cols[ i - 1 ] + ')</div>'
						matcherHtml += '</div>'
						if ( i < colsLength ) {
							sequence.push( 'sidebar-' + i )
						}
					}

					$( '#customize-control-' + control.id ).find( '.gl-template-matcher-sequence' ).html( matcherHtml )

					val = {
						template: template,
						sequence: sequence
					}

					control.setting.set( val )
				}
			)

			// Listen to Template column sequence change.
			$( control.selector ).on(
				'change',
				'.gl-template-matcher select',
				function () {
					// Update control value.
					var sequence = []
					$( this ).parent().parent().find( 'select' ).each(
						function () {
							sequence.push( $( this ).val() )
						}
					);

					val = {
						template: template,
						sequence: sequence
					}

					control.setting.set( val )
				}
			)
		}
	}
)
