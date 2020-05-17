/**
 * Radio Image Control.
 *
 * @package greenlet
 */

wp.customize.controlConstructor['radio-image'] = wp.customize.Control.extend(
	{
		ready: function () {
			var control = this
			var radios  = $( control.selector + ' input[type="radio"]' )

			radios.on(
				'change',
				function () {
					control.setting.set( this.value )
				}
			)
		}
	}
)
