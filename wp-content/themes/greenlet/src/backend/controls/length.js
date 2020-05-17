/**
 * Length Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['length'] = wp.customize.Control.extend(
	{
		ready: function() {
			var control  = this
			var resetVal = control.setting._value

			var lengthRange = $( '#length-size-' + control.id )
			var lengthInput = $( '#length-size-ip-' + control.id )
			var unitSelect  = $( '#length-unit-' + control.id )

			function setLength( value = false ) {
				var size = ''
				if ( false !== value ) {
					size = value
				} else {
					size = control.setting._value
				}
				var matches    = size.match( /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/ )
				var lengthSize = ( null === matches ) ? '' : matches[ 1 ]
				var lengthUnit = ( null === matches ) ? 'px' : matches[ 2 ]
				lengthRange.val( lengthSize )
				lengthInput.val( lengthSize )
				unitSelect.val( lengthUnit )
			}
			setLength()

			function updateLength( element ) {
				var lengthSize = ( element !== unitSelect[0] ) ? element.value : lengthInput.val()
				var lengthUnit = ( element === unitSelect[0] ) ? element.value : unitSelect.val()
				if ( element === lengthRange[0] ) {
					lengthInput.val( lengthSize )
				} else if ( element === lengthInput[0] ) {
					lengthRange.val( lengthSize )
				}
				control.setting.set( '' + lengthSize + lengthUnit )
			}

			lengthRange.on( 'input', function() { updateLength( this ) } )
			lengthInput.on( 'input', function() { updateLength( this ) } )
			unitSelect.on( 'change', function() { updateLength( this ) } )

			$( control.selector + ' .reset' ).on(
				'click',
				function() {
					control.setting.set( resetVal )
					setLength( resetVal )
				}
			)
		}
	}
)
