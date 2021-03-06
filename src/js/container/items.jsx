/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const { bindActionCreators } = require('redux');

const Items = require('../component/item/items');
const {
	addToCollection,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchPublicationsItems,
	fetchTopItems,
	fetchTrashItems,
	preferenceChange,
	sortItems,
} = require('../actions');
const { get, resizeVisibleColumns } = require('../utils');
const { makePath } = require('../common/navigation');
const { getFormattedTableItem } = require('../common/item');
const { omit } = require('../common/immutable');
const defaultSort = { field: 'title', sort: 'ASC' };
const withDevice = require('../enhancers/with-device');
const columnSortKeyLookup = require('../constants/column-sort-key-lookup');

class ItemsContainer extends React.PureComponent {
	handleItemsSelect(items = []) {
		const { push, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';
		push(makePath({ library, search, tags, trash, publications, collection, items, view }));
	}

	handleColumnVisibilityChange(field, isVisible) {
		const { preferences, dispatch } = this.props;
		const columnIndex = preferences.columns.findIndex(c => c.field === field);
		const newColumns = [ ...preferences.columns ];

		var fractionBias;
		if(!newColumns[columnIndex].isVisible && isVisible) {
			fractionBias = newColumns[columnIndex].fraction * -1;
		} else if(newColumns[columnIndex].isVisible && !isVisible) {
			fractionBias = newColumns[columnIndex].fraction;
		}

		resizeVisibleColumns(newColumns, fractionBias);
		newColumns[columnIndex].isVisible = isVisible;
		return dispatch(preferenceChange('columns', newColumns));
	}

	handleColumnReorder(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	handleColumnResize(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	async handleLoadMore({ startIndex, stopIndex }) {
		let start = startIndex;
		let limit = (stopIndex - startIndex) + 1;
		let direction = this.props.sortDirection.toLowerCase();
		let tag = this.props.tags || [];
		const { itemsSource, dispatch, collectionKey, search: q,
			sortBy  } = this.props;
		const sort = columnSortKeyLookup[sortBy] || 'title';
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				await dispatch(fetchItemsQuery({ collection: collectionKey, tag, q }, sortAndDirection));
				break;
			case 'top':
				await dispatch(fetchTopItems(sortAndDirection));
				break;
			case 'trash':
				await dispatch(fetchTrashItems(sortAndDirection));
				break;
			case 'publications':
				await dispatch(fetchPublicationsItems(sortAndDirection));
				break;
			case 'collection':
				await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
				break;
		}
	}

	async handleSort({ sortBy, sortDirection }) {
		this.setState({ items: [] });
		const { dispatch, preferences } = this.props;
		dispatch(preferenceChange('columns', preferences.columns.map(column => {
			if(column.field === sortBy) {
				return { ...column, sort: sortDirection }
			} else {
				return omit(column, 'sort');
			}
		})));
		await dispatch(sortItems(
			sortBy, sortDirection.toLowerCase() // react-virtualised uses ASC/DESC, zotero asc/desc
		));

	}

	async handleDrag({ itemKeys, targetType, collectionKey, libraryKey }) {
		const { dispatch } = this.props;
		if(targetType === 'collection') {
			return await dispatch(addToCollection(itemKeys, collectionKey, libraryKey));
		}
	}

	render() {
		return <Items
			{ ...this.props }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onItemDrag={ this.handleDrag.bind(this) }
			onItemsSelect={ this.handleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onSort={ this.handleSort.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		itemsSource,
		collectionKey,
		tags,
		search,
		itemKey,
		itemKeys,
		isSelectMode,
	} = state.current;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const libraryTags = get(state, ['libraries', libraryKey, 'tags']);
	const isMetaAvailable = !state.fetching.meta;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	const { field: sortBy, sort: sortDirection } = preferences.columns.find(
		column => 'sort' in column
	) || defaultSort
	var itemsData = {};

	if(isMetaAvailable) {
		switch(itemsSource) {
			case 'query':
				itemsData = state.query;
			break;
			case 'top':
				itemsData = get(state, ['libraries', libraryKey, 'itemsTop'], {});
			break;
			case 'trash':
				itemsData = get(state, ['libraries', libraryKey, 'itemsTrash'], {});
			break;
			case 'publications':
				itemsData = state.itemsPublications;
			break;
			case 'collection':
				itemsData = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], {});
			break;
		}
	}
	const totalItemsCount = itemsData.totalResults;
	const isFetchingItems = itemsData.isFetching;
	const items = (itemsData.keys || []).map(itemKey => itemKey ? getFormattedTableItem(
		get(state, ['libraries', libraryKey, 'items', itemKey]),
		itemTypes,
		libraryTags,
		!('unconfirmedKeys' in itemsData && itemsData.unconfirmedKeys.includes(itemKey))
	) : undefined);

	//@TODO: indicate if isDeleting item(s) within visible set
	// const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
	// 		.some(itemKey => items.filter(i => i.key === itemKey));

	return {
		// isDeleting,
		collection,
		collectionKey,
		isFetchingItems,
		isMetaAvailable,
		isReady,
		isSelectMode,
		itemFields,
		items,
		itemsSource,
		itemTypes,
		libraryKey,
		libraryTags,
		preferences,
		search,
		selectedItemKeys: item ? [item.key] : itemKeys,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		tags,
		totalItemsCount,
	};
};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

ItemsContainer.propTypes = {
  collection: PropTypes.object,
  // items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

module.exports = withDevice(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemsContainer));
