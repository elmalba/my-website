/**
 * Border Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['border'] = wp.customize.Control.extend(
	{
		ready: function() {
			// Set initial Values.
			var control       = this
			var widthSelector = $( '#border-width-' + control.id )
			var styleSelector = $( '#border-style-' + control.id )
			var colorSelector = $( '#border-color-' + control.id )

			var border      = control.setting._value
			var borderParts = border.split( ' ' )

			var width = 0
			var style = 'none'
			var color = '#000000'

			if ( borderParts.length === 3 ) {
				width = borderParts[0]
				style = borderParts[1]
				color = borderParts[2]

				// Set width.
				if ( width.indexOf( 'px' ) !== -1 ) {
					width = width.split( 'px' )[0]
				}

				// Set style options.
				var options      = ''
				var styles       = [ 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden' ]
				var stylesLength = styles.length
				for ( var i = 0; i < stylesLength; i++ ) {
					var selected = ( styles[ i ] === style ) ? 'selected' : ''
					options     += '<option value="' + styles[ i ] + '" ' + selected + '>' + styles[ i ] + '</option>'
				}
				styleSelector.html( options )
			}

			widthSelector.val( width )
			styleSelector.val( style )
			colorSelector.val( color )

			function setBorder() {
				if ( $( 'html' ).hasClass( 'window-loaded' ) ) {
					var newValue = widthSelector.val() + 'px ' + styleSelector.val() + ' ' + colorSelector.val()
					control.setting.set( newValue );
				}
			}

			// Listen to changes.
			widthSelector.on( 'change', setBorder )
			styleSelector.on( 'change', setBorder )
			colorSelector.on( 'change', setBorder )
		}
	}
)
