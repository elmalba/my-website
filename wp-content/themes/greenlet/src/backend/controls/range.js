/**
 * Range Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['range'] = wp.customize.Control.extend(
	{
		ready: function() {
			var control  = this
			control.container.append( '<span class="reset dashicons dashicons-undo"></span>' )
			var resetVal = control.setting._value

			$( control.selector + ' .reset' ).on(
				'click',
				function() {
					control.setting.set( resetVal )
				}
			)
		}
	}
)
