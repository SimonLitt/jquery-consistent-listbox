# jquery-consistent-listbox
jQuery singleselect and multiselect listbox plugin. The plugin designed to display consistently and correctly on both mobile devices and desktops. The plugin can be used inside of html forms.

<img width="228" height="356" alt="slb" src="https://github.com/user-attachments/assets/d584878e-797b-4ff0-bef4-dc36f0698532" />
<img width="224" height="356" alt="mlb" src="https://github.com/user-attachments/assets/ae975266-4364-42a6-a452-56ff14627335" />

# Usage
Link jQuery and jQuery UI and the listbox:
``` HTML

		<!-- make sure it is included  jQuery and jQuery UI -->
		<script src="https://code.jquery.com/jquery-3.7.1.min.js" type="text/javascript" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
		<script src="https://code.jquery.com/ui/1.14.1/jquery-ui.min.js" type="text/javascript" integrity="sha256-AlTido85uXPlSyyaZNsjJXeCs07eSv3r43kyCVc8ChI=" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
		<link href="https://code.jquery.com/ui/1.14.1/themes/cupertino/jquery-ui.css" type="text/css" rel="stylesheet" media="screen"  integrity="sha256-1Lhp59o6Lo17agNDv7pxRJSu6j1iExUKwHp/P2I19hQ=" crossorigin="anonymous" referrerpolicy="no-referrer"/>

		<!-- include the plugin and default stylesheet -->
		<script src="javascript/simonlitt/listbox.js" type="text/javascript"></script>
		<link href="javascript/simonlitt/listbox.css" type="text/css" rel="stylesheet"/>
```

Place the listbox container:

``` HTML

<div id="user_listbox" class="sl-listbox sl-h-20"></div>
```
### Initialization
Create listbox object:
``` HTML
<script><!--
	$( function() {
		$('#user_listbox').listbox({
			items: [
				{val: '1', text: 'Item 1'},
				{val: '2', text: 'Item 2'},
				{val: '3', text: 'Item 3', checked: true},
				{val: '4', text: 'Item 4'},
				{val: '5', text: 'Item 5'},
			],
			onChange: function(e, val) {
				console.log(val.old, val.cur);
			}
		});
	});
	//--></script>
```
For the multiselect listbox, you need to specify the `multiSelect` option. If there is more than one listbox of any type on one page, then a unique `name` option should be specified for each one:

``` HTML
<div id="user_multilistbox" class="sl-listbox sl-h-20"></div>
<script><!--
	$( function() {
		$('#user_multilistbox').listbox({
			multiSelect: true,
			name: 'selected_name', // The HTML `name` attribute identifier. Mandatory when there is more than one listbox on one page.
			items: [
				{val: '1', text: 'Item 1', checked: true},
				{val: '2', text: 'Item 2', checked: true},
				{val: '3', text: 'Item 3'},
				{val: '4', text: 'Item 4', checked: true},
				{val: '5', text: 'Item 5'},
			],
			onChange: function(e, val) {
				console.log(val.old, val.cur);
			}
		});
	});
	//--></script>
```

### Options

`multiSelect`	Type:boolean	This is a multiselect listbox, otherwise it is a singleselect listbox. Default false.

`name`	Type:sting	The HTML `name` attribute identifier. Mandatory when there is more than one listbox on one page. Default `lb_name`.

`quiet`	Type:boolean	Disable call `onChange`. Default false.

`autoSort`	Type:boolean	Enable auto sorting. Default false.

`sortOrder`	Type:string	Sort data key. Default null.

`sortable`	Type:boolean	Allowed to sort manually by dragging items. Default false.

`sortOrderStep`	Type:number	`sort_order` data key increment step for auto sorting. Default 10.

### Methods
For more detailed usage information, please refer to the docs and examples directories.

Additionally standard jQuery Widget Factory methods are available, such as `option`.
### Events
onChange( event, val )
