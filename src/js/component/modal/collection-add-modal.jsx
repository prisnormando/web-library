'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Input = require('../form/input');
const Icon = require('../ui/icon');
const defaultState = { name: ''};

class CollectionAddModal extends React.PureComponent {
	state = defaultState;

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;

		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	handleCollectionUpdate = () => {
		const { libraryKey, toggleModal, createCollection,
			parentCollection } = this.props;
		const { name } = this.state;

		if(name.length === 0) { return; }

		createCollection({
			name,
			parentCollection: parentCollection ? parentCollection.key : null
		}, libraryKey);
		toggleModal(null, false);
	}

	handleInputBlur = () => true
	handleChange = name => this.setState({ name })

	render() {
		const { isOpen, toggleModal, parentCollection } = this.props;
		const { name } = this.state;
		const inputId = 'collection-add-modal-input';
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Add a New Collection"
				className="modal-touch modal-centered"
				onRequestClose={ () => toggleModal(null, false) }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						<div className="modal-header-left">
							<Button
								className="btn-link"
								onClick={ () => toggleModal(null, false) }
							>
								Cancel
							</Button>
						</div>
						<div className="modal-header-center">
							<h4 className="modal-title truncate">
								{
									parentCollection ?
										`Add a new Subcollection to ${parentCollection.name}` :
										'Add a new Collection'
								}
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								disabled={ name.length === 0 }
								onClick={ this.handleCollectionUpdate }
							>
								Confirm
							</Button>
						</div>
					</div>
					<div className="modal-body">
						<div className="form">
							<div className="form-group">
								<label htmlFor={ inputId }>
									<Icon type="28/folder" width="28" height="28" />
								</label>
								<Input
									autoFocus
									id={ inputId }
									onBlur={ this.handleInputBlur }
									onChange={ this.handleChange }
									onCommit={ this.handleCollectionUpdate }
									value={ name }
									tabIndex={ 0 }
								/>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		parentCollection: PropTypes.object,
		isOpen: PropTypes.bool,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
		createCollection: PropTypes.func.isRequired
	}
}

module.exports = CollectionAddModal;
