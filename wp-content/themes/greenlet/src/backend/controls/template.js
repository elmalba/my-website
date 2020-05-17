/**
 * Template Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['template'] = wp.customize.Control.extend(
	{
		ready: function () {
			var control  = this
			var radios   = $( control.selector + ' input[type="radio"]' )
			var rawInput = $( control.selector + ' #' + control.id + '-text' )

			var setValue = function( value, element ) {
				if ( element === 'input' ) {
					rawInput.val( value )
				} else if ( element === 'radios' ) {
					radios.val( [ value ] )
				}
				control.setting.set( value )
			}

			rawInput.on( 'input', gl.debounce( 500, function() { setValue( this.value, 'radios' ) } ) )
			radios.on( 'change', function () { setValue( this.value, 'input' ) } )
		}
	}
)
