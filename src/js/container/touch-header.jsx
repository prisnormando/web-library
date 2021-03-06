'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { push } = require('connected-react-router');
const withDevice = require('../enhancers/with-device');
const { itemProp } = require('../constants/item');
const { connect } = require('react-redux');
const { get } = require('../utils');
const { pick } = require('../common/immutable');
const { getCollectionsPath } = require('../common/state');
const TouchHeader = require('../component/touch-header');
const { makePath } = require('../common/navigation');
const { makeChildMap } = require('../common/collection');
const { itemsSourceLabel } = require('../common/format');
const withEditMode = require('../enhancers/with-edit-mode');
const withSelectMode = require('../enhancers/with-select-mode');
const { toggleModal } = require('../actions');

class TouchHeaderContainer extends React.PureComponent {
	handleNavigation = path => {
		this.props.push(makePath(path));
	}

	get childMap() {
		const { collections } = this.props;
		return collections.length ? makeChildMap(collections) : {};
	}

	get itemsSourceNode() {
		const { itemsSource, libraryKey, collectionKey: collection } = this.props;
		const label = itemsSourceLabel(itemsSource);
		return {
			key: itemsSource,
			type: 'itemsSource',
			path: {
				library: libraryKey,
				view: 'item-list',
				trash: itemsSource === 'trash',
				publications: itemsSource === 'publications',
				collection
			},
			label
		}
	}

	get rootNode() {
		return {
			key: 'root',
			type: 'root',
			path: { view: 'libraries' },
			label: 'Libraries'
		};
	}

	get itemNode() {
		const { item, isSelectMode } = this.props;
		return (item && !isSelectMode) ? { key: '', label: '' } : null;
	}

	get isSelectedOpened() {
		const { collectionKey } = this.props;
		const hasChildren = collectionKey in this.childMap;
		return hasChildren;
	}

	get isItemsView() {
		const { view } = this.props;
		return view === 'item-list' || view === 'item-details';
	}

	get isLastNodeCurrentlySelectedCollection() {
		const { collectionKey } = this.props;
		return collectionKey !== null && !this.isSelectedOpened;
	}

	get selectedNode() {
		const { path } = this.props;
		return this.isLastNodeCurrentlySelectedCollection ? path[path.length - 1] : this.itemsSourceNode;
	}

	render() {
		const { path, variant, view, item, isSelectMode, itemKeys,
			collectionKey } = this.props;
		const variants = TouchHeaderContainer.variants;
		var touchHeaderPath, shouldIncludeEditButton, shouldIncludeItemListOptions,
			shouldIncludeCollectionOptions, shouldHandleSelectMode;

		switch(variant) {
			case variants.MOBILE:
				touchHeaderPath = [
					this.rootNode,
					...path,
					this.isItemsView ? this.itemsSourceNode : null,
					this.itemNode
				];
				shouldIncludeEditButton = view === 'item-details';
				shouldIncludeItemListOptions = view === 'item-list' && !isSelectMode;
				shouldHandleSelectMode = view === 'item-list';
				shouldIncludeCollectionOptions = view !== 'libraries' &&
					!shouldIncludeEditButton && !shouldIncludeItemListOptions &&
					!shouldHandleSelectMode;
			break;
			case variants.NAVIGATION:
				touchHeaderPath = [this.rootNode, ...path];
				if(this.isLastNodeCurrentlySelectedCollection) {
					touchHeaderPath.pop();
				}
				shouldIncludeCollectionOptions = true;
			break;
			case variants.SOURCE:
				touchHeaderPath = [ this.selectedNode ];
				shouldIncludeItemListOptions = !isSelectMode;
				shouldHandleSelectMode = true;
			break;
			case variants.SOURCE_AND_ITEM:
				touchHeaderPath = [ this.selectedNode, this.itemNode ];
				shouldIncludeItemListOptions = !item && !isSelectMode;
				shouldHandleSelectMode = true;
				shouldIncludeEditButton = !isSelectMode && !!item;
			break;
			case variants.ITEM:
				touchHeaderPath = [ this.itemNode ];
				shouldIncludeEditButton = !isSelectMode && !!item;
			break;
		}
		touchHeaderPath = touchHeaderPath.filter(Boolean);

		const selectedItemsCount = itemKeys.length;
		const collectionHasChildren = collectionKey in this.childMap;

		const props = { isSelectMode, shouldIncludeEditButton,
			shouldIncludeItemListOptions, shouldIncludeCollectionOptions,
			selectedItemsCount, shouldHandleSelectMode, collectionHasChildren,
			...pick(this.props, ['isEditing', 'className', 'onSelectModeToggle',
				'collectionKey', 'toggleModal'])
		};

		return (
			<TouchHeader
				{ ...props }
				onNavigation={ this.handleNavigation }
				path={ touchHeaderPath }
			/>
		);
	}

	static defaultProps = {
	}

	static propTypes = {
		path: PropTypes.array,
		item: itemProp,
	}

	static variants = {
		MOBILE: 'MOBILE',
		NAVIGATION: 'NAVIGATION',
		SOURCE: 'SOURCE',
		SOURCE_AND_ITEM: 'SOURCE_AND_ITEM',
		ITEM: 'ITEM'
	};
}

const mapStateToProps = state => {
	const {
		libraryKey,
		itemKey,
		view,
		itemsSource,
		collectionKey, //@TODO: rename to collectionKey
	} = state.current;
	const collections = get(state, ['libraries', libraryKey, 'collections'], []);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections[key]
			return {
				key,
				type: 'collection',
				label: name,
				path: { library: libraryKey, collection: key },
			};
		}
	);

	if(libraryKey && view !== 'libraries') {
		path.unshift({
			key: libraryKey,
			type: 'library',
			path: { library: libraryKey, view: 'library' },
			//@TODO: when first loading, group name is not known
			label: libraryKey === state.current.userLibraryKey ?
				"My Library" :
				(state.groups.find(
					g => g.id === parseInt(libraryKey.slice(1), 10)
				) || { name: libraryKey }).name
		})
	}

	return {
		collections: Object.values(collections),
		view,
		libraryKey,
		path,
		item,
		itemsSource,
		collectionKey
	};
};

const TouchHeaderWrapped = withDevice(withSelectMode(withEditMode(
	connect(mapStateToProps, { push, toggleModal })(TouchHeaderContainer)
)));

module.exports = TouchHeaderWrapped;
