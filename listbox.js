/*!
 * jquery-consistent-listbox v0.1 (https://github.com/SimonLitt/jquery-consistent-listbox/)
 * Copyright 2025 Simon Litt.
 * Licensed under MIT (https://github.com/SimonLitt/jquery-consistent-listbox/blob/main/LICENSE)
 */
(function( $ ) {
	$.widget( "simonlitt.listbox", {
		/**
		 * @typedef lb_item
		 * @type {Object}
		 * @property {sting} val - Associated value. When used inside a HTML form, it will be passed in the request.
		 * @property {sting} text - Display text.
		 * @property {sting} class - Optional. Custom css class of the item.
		 * @property {number} sort_order - Optional. Custom sort order.
		 * @property {object} data - Optional. Related user-defined data. Automatic or manual sorting changes or creates the `sort_order` property.
		 */

		/**
		* @typedef lb_options
		* @type {Object}
		* @property {boolean} multiSelect - This is a multiselect listbox, otherwise it is a singleselect listbox. Default false.
		* @property {sting} name - The HTML `name` attribute identifier. Mandatory when there is more than one listbox on one page. Default `lb_name`.
		* @property {boolean} quiet - Disable call `onChange`. Default false.
		* @property {boolean} autoSort - Enable auto sorting. Default false.
		* @property {string} sortOrder - Sort data key. Default null.
		* @property {boolean} sortable - Allowed to sort manually by dragging items. Default false.
		* @property {number} sortOrderStep - `sort_order` data key increment step for auto sorting. Default 10.
		*/
		options: {
			multiSelect: false,
			name: 'lb_name',
			quiet: false,
			autoSort: false,
			sortOrder: null,
			sortable: false,
			sortOrderStep: 10,
		},

		_create: function() {
			this._item_data = new Map();
			if (this.options.items) {
				this._load_items(this.options.items);
				delete this.options.items;
			}
			this.element.addClass('ui-menu').addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all');

			if (this.options.sortable && !this.options.autoSort) {
				this.element.addClass('lb-sortable');
			}

			this.element.delegate('input', 'change', $.proxy( this._itemChange, null, this));
			this.element.delegate('input', 'click', $.proxy( this._itemClick, null, this));
			if (this.options.sortable && !this.options.autoSort) {
				this._set_sortable();
			}
			this._last_val = this.options.multiSelect ? this._sorted_vals() : this.val();
			this._wait_reorder = false;
		},

		_reorder: function() {
			let that = this;
			let sort_order = 1;
			this.element.find('input').each(function() {
				that.setItemDataVar($(this).val(), 'sort_order', sort_order);
				sort_order += that.options.sortOrderStep;
			});
		},

		_set_sortable: function() {
			let that = this;
			this.element.sortable({
				change: function(e, ui) {
					this._wait_reorder = true;
				},
				stop: function(e, ui) {
					if (this._wait_reorder) {
						this._wait_reorder = false;
						that._reorder();
					}
				}
			});
		},

		_item_html:  function(text, value, html_class, is_checked) {
			return '<label class="ui-menu-item ui-menu-item-wrapper ui-corner-all' + (is_checked ? ' ui-state-active' : '') + (html_class ? (' ' + html_class) : '') + '" title="' + text + '"><input type="' + (this.options.multiSelect ? 'checkbox' : 'radio') + '"' + (this.options.name ? (' name="' + this.options.name + '"') : 'lb_name')+ ' class="form-check-input" value="' + value + '"' + (is_checked ? ' checked="checked"' : '') + '/><span class="item-text">' + text + '</span>' + ((this.options.sortable && !this.options.autoSort) ? '<i class="fas fa-sort drag-icon"></i>' : '') + '</label>';
		},

		/**
		 * Gets the specified item index.
		 *
		 * @returns {boolean} The item index.
		 */
		index:  function() {
			return this.getItemIndex(this.val());
		},

		/**
		 * Gets an item index by value.
		 *
		 * @param {string} value - Item value.
		 * @returns {number} The item index.
		 */
		getItemIndex:  function(value) {
			let selected_input = this.element.find('input[value=\'' + value + '\']');
			return selected_input.closest('.ui-menu-item').index();
		},

		_insert: function(index, item, e) {
			let value = item.hasOwnProperty('val') ? String(item.val) : '';
			if (this._item_data.has(value)) {
				return false;
			}
			let text = item.hasOwnProperty('text') ? String(item.text) : '';
			let is_checked = item.hasOwnProperty('checked') ? item.checked : false;
			if (is_checked && !this.options.multiSelect) {
				this._uncheck_all();
			}
			let html_class = item.hasOwnProperty('class') ? String(item.class) : '';
			let sort_order = item.hasOwnProperty('sort_order') ? parseInt(item.sort_order, 10) : 0;
			if (this.options.sortable && this.options.sortOrder) {
				sort_order = 1 + this.options.sortOrderStep * this.length();
			}

			let html = this._item_html(text, value, html_class, is_checked);
			if (index === 0) {
				this.element.prepend(html);
			} else if (!index) {
				this.element.append(html);
			} else {
				let num_index = parseInt(index, 10) || 0;
				num_index++;
				let indexed_ctrl = this.element.find('label.ui-menu-item:nth-child(' + num_index + ')');
				if (indexed_ctrl.length) {
					indexed_ctrl.before(html);
				} else {
					this.element.append(html);
				}
			}
			e
			let data = item.hasOwnProperty('data') && (typeof item.data == 'object') ? item.data : {};
			if (sort_order) {
				data['sort_order'] = sort_order;
			}
			this._item_data.set(value, data);
			return true;
		},

		/**
		 * Adds a item.
		 *
		 * @param {lb_item} item - Item data.
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 */
		add: function(item, is_quiet = false, e = null) {
			if (this._insert(null, item)) {
				if (this.options.autoSort) {
					this.sort(this.options.sortOrder);
				}
				this._change(is_quiet, e);
			}
		},

		/**
		 * Inserts a item into the specified position.
		 *
		 * @param {number} index - Insert position. `autoSort` option can change position after insetrtion.
		 * @param {lb_item} item - Item data.
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 */
		insert: function(index, item, is_quiet = false, e = null) {
			if (this._insert(index, item)) {
				if (this.options.autoSort) {
					this.sort(this.options.sortOrder);
				}
				this._change(is_quiet, e);
			}
		},

		/**
		 * Removes the selected items.
		 *
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 * @returns {boolean} Whether the selected items were found and removed.
		 */
		remove: function(is_quiet = false, e = null) {
			let chk_list = this.element.find('input:checked');
			let has_affected = chk_list.length;
			if (has_affected) {
				let that = this;
				chk_list.each(function() {
					that._item_data.delete($(this).val());
				});
				chk_list.off().parent().remove();
				if (this.options.autoSort) {
					this.sort(this.options.sortOrder);
				}
				this._change(is_quiet, e);
			}
			return has_affected;
		},

		/**
		 * Deletes the specified item.
		 *
		 * @param {string} value - Item value.
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 * @returns {boolean} Whether the specified items were found and deleted.
		 */
		delete: function(value, is_quiet = false, e = null) {
			let chk_list = this.element.find('input[value=\'' + value + '\']');
			let has_affected = chk_list.length;
			if (has_affected) {
				this._item_data.delete(String(value));
				chk_list.off().parent().remove();
				if (this.options.autoSort) {
					this.sort(this.options.sortOrder);
				}
				this._change(is_quiet, e);
			}
			return has_affected
		},

		_clear: function(e) {
			let chk_list = this.element.find('input');
			let result = Boolean(chk_list.length);
			if (result) {
				chk_list.off().parent().remove();
				this._item_data.clear();
			}
			return result;
		},

		/**
		 * Deletes all items.
		 *
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 */
		clear: function(is_quiet = false, e = null) {
			if (this._clear(e)) {
				this._change(is_quiet, e);
			}
		},

		_load_items: function(items) {
			if (items && Array.isArray(items) && items.length) {
				for (const item of items) {
					this._insert(null, item);
				}
				if (this.options.autoSort) {
					this.sort(this.options.sortOrder);
				}
			}
		},

		/**
		 * Deletes all items and insert specified new items.
		 *
		 * @param {boolean} is_quiet - Disable or enable call `onChange`. Default false.
		 * @param {object} e - jQuery event or another data which will be transferred to `onChange`. Default null.
		 */
		replace: function(items, is_quiet = false, e = null) {
			this._clear(e);
			this._load_items(items);
			this._change(is_quiet, e);
		},

		/**
		 * Returns the number of items.
		 *
		 * @returns {number} Number of elements.
		 */
		length: function() {
			return this.element.find('input').length;
		},

		/**
		 * Returns selected item value.
		 *
		 * @returns {string} Selected item value.
		 */
		val: function() {
			let chk_list = this.element.find('input:checked');
			return chk_list.length ? chk_list.val() : null;
		},

		/**
		 * Checks if at least one item is selected.
		 *
		 * @returns {boolean} At least one item is selected.
		 */
		hasSelected: function() {
			return Boolean(this.element.find('input:checked').length);
		},

		/**
		 * Returns selected items values.
		 *
		 * @returns {array} Selected items values.
		 */
		vals: function() {
			let vals = [];
			this.element.find('input:checked').each(function() {
				vals.push($(this).val());
			});
			return vals;
		},

		/**
		 * Sorts items.
		 *
		 * @param {boolean} is_sort_by_order - Sort by `sort_order` property of the related data. Default null.
		 */
		sort: function(is_sort_by_order = null) {
			let that = this;
			this.element.html($(this.element.find('label.ui-menu-item').toArray().sort(function(a, b) {
				let a_val, b_val;
				if (is_sort_by_order === null) {
					a_val = $(a).find('span.item-text').text();
					b_val = $(b).find('span.item-text').text();
				} else {
					a_val = $(a).find('input.form-check-input').val();
					b_val = $(b).find('input.form-check-input').val();

					if (is_sort_by_order) {
						let a_order = parseInt(that.getItemDataVar(a_val, 'sort_order'), 10) || 0;
						let b_order = parseInt(that.getItemDataVar(b_val, 'sort_order'), 10) || 0;

						if (a_order === b_order) {
							a_val = $(a).find('span.item-text').text();
							b_val = $(b).find('span.item-text').text();
						} else {
							return a_order - b_order;
						}
					}
				}
				return a_val.localeCompare(b_val);
			})));
		},

		/**
		 * Returns `sort_order` property of the related data.
		 *
		 * @returns {number} `sort_order` property of the related data.
		 */
		getSortOrder: function() {
			return getItemDataVar(this.val(), 'sort_order');
		},

		/**
		 * Sets `sort_order` property of the related data..
		 *
		 * @param {number} sort_order - `sort_order` value.
		 */
		setSortOrder: function(sort_order) {
			this.setItemDataVar(this.val(), 'sort_order', sort_order);
		},

		/**
		 * Gets selected item text.
		 *
		 * @returns {string} Item text.
		 */
		getText: function() {
			return this.getItemText(this.val());
		},

		/**
		 * Sets selected item text.
		 * {string} text - New text for the selected item.
		 */
		setText: function(text) {
			this.setItemText(this.val(), text);
		},

		/**
		 * Gets item text by value.
		 *
		 * @param {string} value - An item value.
		 * @returns {string} Item text.
		 */
		getItemText: function(value) {
			return this.element.find('input[value=\'' + value + '\']').parent().find('span.item-text').text();
		},

		/**
		 * Sets item text by value.
		 *
		 * @param {string} value - An item value.
		 * @param {string} text - New text for the item.
		 */
		setItemText: function(value, text) {
			this.element.find('input[value=\'' + value + '\']').parent().find('span.item-text').text(text);
		},

		/**
		 * Gets assigned data.
		 * @param {boolean} is_as_array - Whether to return the result as an array (sorted as in the listbox control), otherwise return the object (when iterating over the properties of this object, the result will be sorted by value). Default false.
		 * @param {boolean} is_return_text - Update data object field with the item text. Default false.
		 * @param {string} text_alias - From which property of the data to take the value of the text. Default is empty string, which means take it from the `text` property of the data object.
		 * @returns {(array|object)}  Assigned data.
		 */
		getAllData: function(is_as_array = false, is_return_text = false, text_alias = '') {
			let that = this;
			let all_data;
			if (is_as_array) {
				all_data = [];
				this.element.find('input').each(function() {
					let value = $(this).val();
					data = that.getItemData(value);
					if (is_return_text) {
						data[text_alias ? text_alias : 'text'] = $(this).parent().find('span.item-text').text();
					}
					all_data.push(data);

				});
			} else {
				all_data = {};
				this.element.find('input').each(function() {
					let value = $(this).val();
					all_data[value] = that.getItemData(value);
					if (is_return_text) {
						all_data[value][text_alias ? text_alias : 'text'] = $(this).parent().find('span.item-text').text();
					}
				});
			}
			return all_data;
		},

		/**
		 * Gets selected item object.
		 * @param {boolean} is_with_data - Whether to return assigned data. Default true.
		 * @returns {lb_item} Selected item object.
		 */
		item: function(is_with_data = true) {
			return this._getItem(this.val(), is_with_data);
		},

		/**
		 * Gets list of selected items.
		 * @param {boolean} is_with_data - Whether to return assigned data. Default true.
		 * @returns {array} List of items.
		 */
		items: function(is_with_data = true) {
			let that = this;
			let items = [];
			this.element.find('input:checked').each(function() {
				items.push(that._getItem($(this).val(), is_with_data));
			});
			return items;
		},

		/**
		 * Checks if an element with the specified value exists.
		 * @param {string} value - An item value.
		 * @returns {boolean} Does the element exist.
		 */
		hasItem: function(value) {
			return Boolean(this.element.find('input[value=\'' + value + '\']').length);
		},

		_getItem: function(value, is_with_data) {
			return is_with_data ? {val: value, text: this.getItemText(value), data: this.getItemData(value)} : {val: value, text: this.getItemText(value)};
		},

		/**
		 * Gets item object by an item value.
		 * @param {string} value - An item value.
		 * @param {boolean} is_with_data - Whether to return assigned data. Default true.
		 * @returns {lb_item} Item object.
		 */
		getItem: function(value, is_with_data = true) {
			if (!this.hasItem(value)) {
				return null;
			}
			return this._getItem(value, is_with_data);
		},

		/**
		 * Gets selected item assigned data.
		 * @returns {object} Related user-defined data.
		 */
		getData: function() {
			return this.getItemData(this.val());
		},

		/**
		 * Updates related user-defined data. All unaffected properties remain unchanged.
		 * @param {object} data - Data object.
		 * @param {string} is_update_text - Whether to update the item text. Default false.
		 * @param {string} text_alias - From which property of the data to take the value of the text. Default is empty string, which means take it from the `text` property of the data object.
		 */
		updateData: function(data, is_update_text = false, text_alias = '') {
			this.updateItemData(this.val(), data, is_update_text, text_alias);
		},

		/**
		 * Replaces the user-defined data with a new object.
		 * @param {object} new_data - Data object.
		 * @param {string} is_update_text - Whether to update the item text. Default false.
		 * @param {string} text_alias - From which property of the data to take the value of the text. Default is empty string, which means take it from the `text` property of the data object.
		 */
		replaceData: function(new_data, is_update_text = false, text_alias = '') {
			this.replaceItemData(this.val(), new_data, is_update_text, text_alias);
		},

		/**
		 * Gets item assigned data by an item value.
		 * @param {string} value - An item value.
		 * @returns {object} Related user-defined data.
		 */
		getItemData: function(value) {
			if (value === null) {
				return null;
			}
			let _item_id = String(value);
			return this._item_data.has(_item_id) ? this._item_data.get(_item_id) : null;
		},

		/**
		 * Updates related user-defined data by item value. All unaffected properties remain unchanged.
		 * @param {string} value - An item value.
		 * @param {object} data - Data object.
		 * @param {string} is_update_text - Whether to update the item text. Default false.
		 * @param {string} text_alias - From which property of the data to take the value of the text. Default is empty string, which means take it from the `text` property of the data object.
		 */
		updateItemData: function(value, data, is_update_text = false, text_alias = '') {
			if (value !== null) {
				let _item_id = String(value);
				if (this._item_data.has(_item_id)) {
					if (typeof data !== 'object') {
						data = {};
					}
					let field_name = text_alias ? text_alias : 'text';
					if (is_update_text && data.hasOwnProperty(field_name)) {
						this.setItemText(value, data[field_name]);
					}
					let data_obj = this._item_data.get(_item_id);
					Object.entries(data).forEach(([key, val]) => {
						data_obj[key] = val;
					});
				}
			}
		},

		/**
		 * Replaces the user-defined data with a new object by item value.
		 * @param {object} new_data - Data object.
		 * @param {string} is_update_text - Whether to update the item text. Default false.
		 * @param {string} text_alias - From which property of the data to take the value of the text. Default is empty string, which means take it from the `text` property of the data object.
		 */
		replaceItemData: function(value, new_data, is_update_text = false, text_alias = '') {
			if (value !== null) {
				let _item_id = String(value);
				if (this._item_data.has(_item_id)) {
					if (typeof new_data !== 'object') {
						new_data = {};
					}
					let field_name = text_alias ? text_alias : 'text';
					if (is_update_text && new_data.hasOwnProperty(field_name)) {
						this.setItemText(value, new_data[field_name]);
					}
					this._item_data.set(new_data);
				}
			}
		},

		/**
		 * Gets a user-defined data property by key.
		 * @param {string} key - Property key.
		 * @returns Property value.
		 */
		getDataVar: function(key) {
			return this.getItemDataVar(this.val(), key);
		},

		/**
		 * Sets a user-defined data property by key.
		 * @param {string} key - Property key.
		 * @param {string} prop - Property value.
		 */
		setDataVar: function(key, prop) {
			this.setItemDataVar(this.val(), key, prop);
		},

		/**
		 * Unsets a user-defined data property property by key.
		 * @param {string} key - Property key.
		 */
		unsetDataVar: function(key) {
			this.unsetItemDataVar(this.val(), key);
		},

		/**
		 * Gets user-defined data property by item value and property key.
		 * @param {string} value - An item value.
		 * @param {string} key - Property key.
		 * @returns Property value.
		 */
		getItemDataVar: function(value, key) {
			if (value === null) {
				return null;
			}
			let _item_id = String(value);
			let item_var = null;
			if (this._item_data.has(_item_id)) {
				let data = this._item_data.get(_item_id);
				if (data.hasOwnProperty(key)) {
					item_var = data[key];
				}
			}
			return item_var;
		},

		/**
		 * Sets user-defined data property by item value and property key.
		 * @param {string} value - An item value.
		 * @param {string} key - Property key.
		 * @param {string} prop - Property value.
		 */
		setItemDataVar: function(value, key, prop) {
			if (prop !== null) {
				let _item_id = String(value);
				if (this._item_data.has(_item_id)) {
					let data = this._item_data.get(_item_id);
					data[key] = prop;
				}
			}
		},

		/**
		 * Unsets a user-defined data property property by item value and property key.
		 * @param {string} value - An item value.
		 * @param {string} key - Property key.
		 */
		unsetItemDataVar: function(value, key) {
			if (value !== null) {
				let _item_id = String(value);
				if (this._item_data.has(_item_id)) {
					let data = this._item_data.get(_item_id);
					if (data.hasOwnProperty(key)) {
						delete data[key];
					}
				}
			}
		},

		_sorted_vals: function() {
			return this.vals().sort();
		},

		_setOption: function(key, value) {
			let is_reorder = false;
			switch( key ) {
				case 'multiSelect':
					this.element.find('input').attr('type', value ? 'checkbox' : 'radio');
					this._last_val = value ? this._sorted_vals() : this.val();
					break;
				case 'name':
					if (value) {
						this.element.find('input').attr('name', value);
					} else {
						this.element.find('input').removeAttr('name');
					}
					break;
				case 'sortable':
					if (value) {
						if (!this.options.sortable && !this.options.autoSort) {
							this._set_sortable();
						}
					} else {
						if (this.options.sortable && !this.options.autoSort) {
							this.element.sortable('destroy');
						}
					}
					break;
				case 'autoSort':
					if (value) {
						if (this.options.sortable && !this.options.autoSort) {
							this.element.sortable('destroy');
						}
					} else {
						if (this.options.sortable && this.options.autoSort) {
							this._set_sortable();
						}
					}
					break;
				case 'sortOrderStep':
					is_reorder = true;
					break;
			}

			this._super(key, value);

			if (is_reorder) {
				this._reorder();
			}
		},

		_setOptions: function(options) {
			var that = this;
			$.each(options, function(key, value) {
				that._setOption(key, value);
			});
		},

		_destroy: function() {
			this.element.removeClass('ui-menu').removeClass('ui-widget').removeClass('ui-widget-content').removeClass('ui-corner-all').removeClass('lb-sortable');
			this.element.html('');
			this.element.off('click', 'input');
			if (this.options.sortable && !this.options.autoSort) {
				this.element.sortable('destroy');
			}
		},

		_uncheck_all: function() {
			this.element.find('label.ui-state-active').removeClass("ui-state-active");
		},

		_itemClick: function(that, e) {
			let list_item = $(this);
			that._trigger('onClick', e, list_item.val());
		},

		_itemChange: function(that, e) {
			let list_item = $(this);
			if (that.options.multiSelect) {
				if (list_item.prop('checked')) {
					list_item.parent().addClass("ui-state-active");
				} else {
					list_item.parent().removeClass("ui-state-active");
				}
			} else {
				that._uncheck_all();
				if (list_item.prop('checked')) {
					list_item.parent().addClass("ui-state-active");
				}
			}
			that._change(false, e);
		},

		_change: function(is_quiet, e) {
			if (this.options.quiet) {
				return;
			}
			if (this.options.multiSelect) {
				let new_vals = this._sorted_vals();
				if (new_vals.length !== this._last_val.length || !this._last_val.every(function(value, index) {
					return value === new_vals[index];
				})) {
					if (!is_quiet) {
						this._trigger('onChange', e, {cur: new_vals, old: this._last_val});
					}
					this._last_val = new_vals;
				}
			} else {
				let new_val = this.val();
				if (new_val !== this._last_val) {
					if (!is_quiet) {
						this._trigger('onChange', e, {cur: new_val, old: this._last_val});
					}
					this._last_val = new_val;
				}
			}
		},
	});
}( jQuery ) );
