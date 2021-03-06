'use strict';

const api = require('zotero-api-client')().api;
const {
	REQUEST_EXPORT_ITEMS,
	RECEIVE_EXPORT_ITEMS,
	ERROR_EXPORT_ITEMS,
	REQUEST_CITE_ITEMS,
	RECEIVE_CITE_ITEMS,
	ERROR_CITE_ITEMS,
} = require('../constants/actions');

const exportItems = (itemKeys, format) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;

		dispatch({
			type: REQUEST_EXPORT_ITEMS,
			itemKeys,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({ itemKey: itemKeys.join(','), format });

			const exportData = await response.response.blob();

			dispatch({
				type: RECEIVE_EXPORT_ITEMS,
				itemKeys,
				libraryKey,
				exportData,
				response
			});

			return exportData;
		} catch(error) {
			dispatch({
				type: ERROR_EXPORT_ITEMS,
				error,
				itemKeys,
				libraryKey
			});
		}
	};
};

const citeItems = (itemKeys, style = 'chicago-note-bibliography') => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraryKey } = state.current;

		dispatch({
			type: REQUEST_CITE_ITEMS,
			itemKeys,
			libraryKey,
			style,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({
					itemKey: itemKeys.join(','),
					include: 'citation',
					style
				});

			const citations = await response.getData().map(d => d.citation)

			dispatch({
				type: RECEIVE_CITE_ITEMS,
				itemKeys,
				libraryKey,
				citations,
				response,
			});

			return citations;
		} catch(error) {
			dispatch({
				type: ERROR_CITE_ITEMS,
				error,
				itemKeys,
				libraryKey,
			});
		}
	};
};

module.exports = { exportItems, citeItems };
