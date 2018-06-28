'use strict';

const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_TOP_ITEMS,
} = require('../../constants/actions.js');
const { get, indexByKey } = require('../../utils');
const { removeKeys } = require('../../common/immutable');

const items = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				[action.item.key]: action.item
			};
		case RECEIVE_DELETE_ITEM:
			return removeKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return removeKeys(state, action.itemKeys);
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				[action.itemKey]: {
					...get(state, action.itemKey, {}),
					...action.item
				}
			};
		case RECEIVE_CHILD_ITEMS:
			return {
				...state,
				...indexByKey(action.childItems, 'key')
			};
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_TOP_ITEMS:
			return {
				...state,
				...indexByKey(action.items, 'key')
			};
		default:
			return state;
	}
};

module.exports = items;