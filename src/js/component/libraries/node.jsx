'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('../ui/icon');
const { DropTarget } = require('react-dnd');
const { noop } = require('../../utils');
const { ITEM } = require('../../constants/dnd');
const { omit } = require('../../common/immutable');
const { isTriggerEvent } = require('../../common/event');

const dndSpec = {
	drop(props, monitor) {
		if(monitor.isOver({ shallow: true })) {
			const { dndTarget } = props;
			return dndTarget;
		}
	},
	canDrop({ dndTarget = {} }) {
		return dndTarget.targetType === 'collection';
	}
}

const dndCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

@DropTarget(ITEM, dndSpec, dndCollect)
class Node extends React.PureComponent {
	handleTwistyClick = ev => {
		ev && ev.stopPropagation();
		this.props.onOpen();
	}

	handleMouseLeave = () => {
		clearTimeout(this.ongoingLongPress);
	}

	handleMouseUp = () => {
		if(this.isLongPress && !this.isLongPressCompleted) {
			clearTimeout(this.ongoingLongPress);
			this.isLongPressCompleted = false;
		}
	}

	handleMouseClick = ev => {
		if(!this.isLongPress || !this.isLongPressCompleted) {
			this.props.onClick(ev);
		}
		this.isLongPress = false;
		this.isLongPressCompleted = false;
	}

	handleMouseDown = ev => {
		if(!('onRename' in this.props)) {
			this.isLongPress = false;
			return;
		}

		this.isLongPress = true;
		this.isLongPressCompleted = false;
		ev.persist();
		this.ongoingLongPress = setTimeout(() => {
			this.isLongPressCompleted = true;
			ev.preventDefault();
			this.props.onRename(ev);
		}, 500);
	}

	handleKeyDown = ev => {
		const { onOpen } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === "ArrowLeft") {
			onOpen(false);
		} else if(ev.key === "ArrowRight") {
			onOpen(true);
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
		}
	}

	render() {
		const {
			canDrop,
			children,
			className,
			connectDropTarget,
			hideTwisty,
			isOpen,
			isOver,
			subtree,
		} = this.props;

		const twistyButton = (
			<button
				type="button"
				className="twisty"
				onClick={ this.handleTwistyClick }
			>
				<Icon type={ '16/triangle' } width="16" height="16" />
			</button>
		);
		const isActive = canDrop && isOver;
		const props = omit(this.props, ["canDrop", "children", "className",
			"connectDropTarget", "dndTarget", "hideTwisty", "isOpen", "isOver",
			"onOpen", "subtree", "onClick", "onRename"
		]);

		return connectDropTarget(
			<li
				className={ className }
				>
				<div
					className={ cx('item-container', { 'dnd-target': isActive }) }
					role="treeitem"
					aria-expanded={ isOpen }
					onMouseDown={ this.handleMouseDown }
					onMouseUp={ this.handleMouseUp }
					onMouseLeave={ this.handleMouseLeave }
					onClick={ this.handleMouseClick }
					onKeyDown={ this.handleKeyDown }
					{ ...props }
				>
					{ subtree && !hideTwisty ? twistyButton : null }
					{ children }
				</div>
				{ subtree }
			</li>
		);
	}

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		className: PropTypes.string,
		hideTwisty: PropTypes.bool,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		onOpen: PropTypes.func,
		subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	}

	static defaultProps = {
		onClick: noop,
		onOpen: noop,
	}
}

module.exports = Node;
